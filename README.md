## API Documentation

### Country API

#### GET `/api/country/[code]`

Retrieves comprehensive trade data for a specific country using the ISO alpha-2 country code.

**URL Parameters:**
- `code`: ISO alpha-2 country code (e.g., 'CN' for China, 'US' for United States)

**Query Parameters:**
- `year`: (optional) Filter data by specific year
- `include_products`: (optional) Include product categories breakdown (set to 'true')
- `product_limit`: (optional) Number of top products to return (default: 10)

**Response Format:**
```json
{
  "countryCode": "CN",
  "summary": {
    "country": "CN",
    "import_value": 194803613.776,
    "export_value": 188642651.313,
    "total_value": 383446265.089,
    "min_year": "2023-01-01",
    "max_year": "2023-01-01",
    "trade_count": 9756
  },
  "yearlyTrends": [
    {
      "year": 2023,
      "import_value": 194803613.776,
      "export_value": 188642651.313,
      "total_value": 383446265.089,
      "trade_count": 9756
    }
  ],
  "tradeFlows": [
    {
      "tradeflow_id": "102", // Export flow
      "transaction_count": 5795,
      "total_value": 188642651.313,
      "average_value": 32552.657,
      "min_value": 0.001,
      "max_value": 14645476
    },
    {
      "tradeflow_id": "103", // Import flow
      "transaction_count": 3961,
      "total_value": 194803613.776,
      "average_value": 49180.412,
      "min_value": 0,
      "max_value": 18338452
    }
  ],
  "productCategories": {
    "imports": [
      {
        "category_id": "6708",
        "product_name": "Iron and steel",
        "product_code": "72",
        "hs_level": 2,
        "value": 18338452,
        "transaction_count": 1
      }
      // More import products...
    ],
    "exports": [
      {
        "category_id": "6683",
        "product_name": "Machinery and mechanical appliances",
        "product_code": "84",
        "hs_level": 2,
        "value": 14645476,
        "transaction_count": 1
      }
      // More export products...
    ]
  }
}
```

**Example Requests:**
- Basic country data: `/api/country/US`
- With product data: `/api/country/CN?include_products=true`
- Filter by year: `/api/country/JP?year=2023&include_products=true` 
- Limit product results: `/api/country/SG?include_products=true&product_limit=5` 