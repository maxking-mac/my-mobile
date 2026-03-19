// API 调用封装
const { LOCAL_PRODUCTS } = require('../data/local-products');
const ZHIPU_API_KEY = 'YOUR_ZHIPU_API_KEY'; // 替换为你的智谱API Key
const ZHIPU_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

/**
 * 四层查询链路
 * 1. 本地硬编码
 * 2. 云数据库（可选）
 * 3. Open Food Facts
 * 4. 未命中
 */
function queryProduct(barcode) {
  return new Promise((resolve) => {
    // 第一层：本地硬编码产品库
    const local = LOCAL_PRODUCTS.find(p => p.barcode === barcode);
    if (local) {
      return resolve({ source: 'local', product: local });
    }

    // 第二层：云数据库（如已开通云开发）
    // 暂时跳过，直接走第三层
    queryOpenFoodFacts(barcode).then(result => {
      if (result) {
        resolve({ source: 'openfoodfacts', product: result });
      } else {
        resolve({ source: 'notfound', product: null });
      }
    }).catch(() => {
      resolve({ source: 'notfound', product: null });
    });
  });
}

/**
 * 查询 Open Food Facts
 */
function queryOpenFoodFacts(barcode) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      method: 'GET',
      timeout: 8000,
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.status === 1) {
          const p = res.data.product;
          const ingredientsText =
            p.ingredients_text_zh ||
            p.ingredients_text ||
            p.ingredients_text_en || '';
          resolve({
            barcode,
            name: p.product_name_zh || p.product_name || '未知产品',
            brand: p.brands || '',
            image: p.image_url || '',
            ingredients: ingredientsText,
            weight: p.quantity || ''
          });
        } else {
          resolve(null);
        }
      },
      fail() {
        reject(new Error('网络请求失败'));
      }
    });
  });
}

/**
 * 调用智谱 GLM-4V-Flash 识别图片中的配料表
 */
function recognizeIngredientsByImage(imagePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath: imagePath,
      encoding: 'base64',
      success(fileRes) {
        const base64 = fileRes.data;
        wx.request({
          url: `${ZHIPU_BASE_URL}/chat/completions`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${ZHIPU_API_KEY}`,
            'Content-Type': 'application/json'
          },
          data: {
            model: 'glm-4v-flash',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: { url: `data:image/jpeg;base64,${base64}` }
                  },
                  {
                    type: 'text',
                    text: '请识别图片中的食品配料表，提取出所有配料，用中文顿号（、）分隔列出。只输出配料列表，不要其他内容。如果图片不是配料表，回复"无法识别"。'
                  }
                ]
              }
            ],
            max_tokens: 500
          },
          timeout: 15000,
          success(res) {
            if (res.statusCode === 200 && res.data && res.data.choices) {
              const text = res.data.choices[0].message.content || '';
              if (text.includes('无法识别')) {
                reject(new Error('无法识别配料表'));
              } else {
                resolve(text.trim());
              }
            } else {
              reject(new Error('AI识别失败'));
            }
          },
          fail(err) {
            reject(new Error('网络请求失败: ' + err.errMsg));
          }
        });
      },
      fail(err) {
        reject(new Error('读取图片失败: ' + err.errMsg));
      }
    });
  });
}

/**
 * 调用智谱 GLM-4-Flash 分析配料（文本）
 */
function analyzeIngredientsByAI(ingredientsText) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${ZHIPU_BASE_URL}/chat/completions`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'glm-4-flash',
        messages: [
          {
            role: 'user',
            content: `请分析以下食品配料表，用中文顿号（、）重新整理配料列表，去掉括号说明，每个配料独立列出。配料：${ingredientsText}。只输出整理后的配料列表。`
          }
        ],
        max_tokens: 300
      },
      timeout: 10000,
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.choices) {
          resolve(res.data.choices[0].message.content || ingredientsText);
        } else {
          resolve(ingredientsText);
        }
      },
      fail() {
        resolve(ingredientsText);
      }
    });
  });
}

/**
 * 保存产品到云数据库（需开通云开发）
 */
function saveToCloud(product) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('未开通云开发'));
      return;
    }
    wx.cloud.database().collection('products').add({
      data: {
        ...product,
        createdAt: wx.cloud.database.serverDate()
      },
      success(res) {
        resolve(res._id);
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

module.exports = {
  queryProduct,
  queryOpenFoodFacts,
  recognizeIngredientsByImage,
  analyzeIngredientsByAI,
  saveToCloud
};
