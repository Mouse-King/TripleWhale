const axios = require("axios");
const cron = require("node-cron");
const { BigQuery } = require("@google-cloud/bigquery");



async function loadJsonToBigQueryTeleties() {

  const datasetId = "JoyJolt";
  const tableId = "TripleWhale";
 
  let today = new Date();

  // console.log(today);
  // let yesterdayTimestamp = today.getTime() - (24 * 60 * 60 * 1000);
  // let yesterday = new Date(yesterdayTimestamp);

  // let row_date = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  // let today_txt = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  // console.log(today_txt);

  let id = 2;
  for (; id < 23; id++) {
  let today_txt = "2024-03-"+ (id-1).toString().padStart(2, "0");
  const { data } = await axios.post(
    "https://api.triplewhale.com/api/v2/summary-page/get-data",
    {
      "shopDomain": "teleties-dev.myshopify.com",
      "period": {
        "start": "2024-03-" + id.toString().padStart(2, "0"),
        "end": "2024-03-" + id.toString().padStart(2, "0"),
      },
      "todayHour": 24,
    },
    {
      headers: {
        "x-api-key":"98fcd323-dd54-498e-942b-61d1fde9b4f7",
        "Content-Type":"application/json",
        "accept":"*/*"
      },
    }
  );

  let i = 0;
  let len = data.metrics.length;
  let row = {}
  for (; i < len; i++)
  {
    if (data.metrics[i].title == "Net Profit")
      row = {...row, net_profit_current_usd : (data.metrics[i].values.current).toFixed(2), net_profit_previous_usd: (data.metrics[i].values.previous).toFixed(2), net_profit_delta_percent: data.metrics[i].delta};

    if (data.metrics[i].title == "Net Margin")
      row = {...row, net_margin_current_usd: (data.metrics[i].values.current).toFixed(2), net_margin_previous_usd: (data.metrics[i].values.previous).toFixed(2), net_margin_delta_percent: data.metrics[i].delta};
    
    if (data.metrics[i].title == "MER")
      row = {...row, mer_current_usd: (data.metrics[i].values.current).toFixed(2), mer_previous_usd: (data.metrics[i].values.previous).toFixed(2), mer_delta_percent: data.metrics[i].delta};
  
    if (data.metrics[i].title == "Blended ROAS")
      row = {...row, blended_roas_current: (data.metrics[i].values.current).toFixed(2), bleded_roas_previous: (data.metrics[i].values.previous).toFixed(2), blended_roas_delta_percent: data.metrics[i].delta};
  
    if (data.metrics[i].title == "Blended Ad Spend" && data.metrics[i].id == "blendedAds")
      row = {...row, blended_ad_spend_current_usd: (data.metrics[i].values.current).toFixed(2), blended_ad_spend_previous_usd: (data.metrics[i].values.previous).toFixed(2), blended_ad_spend_delta_percent: data.metrics[i].delta};
  
    if (data.metrics[i].title == "New Customers CPA")
      row = {...row, new_customers_cpa_current_usd: (data.metrics[i].values.current).toFixed(2), new_customers_cpa_previous_usd: (data.metrics[i].values.previous).toFixed(2), new_customers_cpa_delta_percent: data.metrics[i].delta};
  
    if (data.metrics[i].title == "Blended CPA")
      row = {...row, blended_cpa_current_usd: (data.metrics[i].values.current).toFixed(2), blended_cpa_previous_usd: (data.metrics[i].values.previous).toFixed(2), blended_cpa_delta_percent: data.metrics[i].delta};
  
    if (data.metrics[i].title == "New Customer ROAS")
      row = {...row, new_customer_roas_current: (data.metrics[i].values.current), new_customer_roas_previous: (data.metrics[i].values.previous),
      new_customer_roas_delta_percent: data.metrics[i].delta};
  
    if (data.metrics[i].title == "Average Order Value")
      row = {...row, average_order_value_current_usd: (data.metrics[i].values.current).toFixed(2), average_order_value_previous_usd: (data.metrics[i].values.previous).toFixed(2), average_order_value_delta_percent: data.metrics[i].delta}
  
    if (data.metrics[i].title == "New Customer Revenue" && data.metrics[i].id == "newCustomerSales")
      row = {...row, new_customer_revenue_usd: (data.metrics[i].values.current).toFixed(2), new_customer_revenue_previous_usd: (data.metrics[i].values.previous).toFixed(2), new_customer_revenue_delta_percent: data.metrics[i].delta}
  
    if (data.metrics[i].title == "Returning Customer Revenue" && data.metrics[i].id == "rcRevenue")
      row = {...row, returning_customer_revenue_current_usd: (data.metrics[i].values.current).toFixed(2), returning_customer_revenue_previous_usd: (data.metrics[i].values.previous).toFixed(2), returning_customer_revenue_delta_percent: data.metrics[i].delta}
  
    if (data.metrics[i].title == "Total Sales")
      row = {...row, total_sales_current_usd: (data.metrics[i].values.current).toFixed(2), total_sales_previous_usd: (data.metrics[i].values.previous).toFixed(2), total_sales_delta_percent: data.metrics[i].delta}
  
    if (data.metrics[i].title == "Returns")
      row = {...row, returns_current_usd: (data.metrics[i].values.current).toFixed(2), returns_previous_usd: (data.metrics[i].values.previous).toFixed(2), returns_delta_percent: data.metrics[i].delta}
  }

  row = {...row, date: today_txt}

  console.log("data================>", row);

  const bigquery = new BigQuery();

  await bigquery.dataset(datasetId).table(tableId).insert(row);
  }

}

// cron.schedule("5 0 0 * * *", function () {
//   console.log(
//     "========================Cron Job==============================="
//   );
  loadJsonToBigQueryTeleties();
// });
