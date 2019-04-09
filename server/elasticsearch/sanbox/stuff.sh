#!/usr/bin/env bash

// DEVELOPMENT



{
      "number_of_replicas": 0
}






{
      "number_of_shards": 5,
      "number_of_replicas": 0
}

curl -X GET "http://178.128.190.197:9200/hitbtc_scanner_socket/_search" -H 'Content-Type: application/json' -d'

{
  "size": 1,
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "percent_rise": {
              "gte": 0
            }
          }
        },
        {
          "range": {
            "percent_drop": {
              "gte": 0
            }
          }
        },
        {
          "range": {
            "volume_quote_btc_24h": {
              "gte": 0,
              "lte": 29733
            }
          }
        },
        {
          "range": {
            "date": {
              "from": "now-60480m",
              "to": "now-0m"
            }
          }
        }
      ],
      "must_not": [
        {
          "terms": {
            "quote.keyword": [
              "DAI",
              "TUSD",
              "EURS",
              "EOS"
            ]
          }
        }
      ]
    }
  }
}

'











curl -X POST "localhost:9200/hitbtc_scanner_socket/_search?allow_partial_search_results=false" '
{
  "query": {
    "bool": {
      "must": [],
      "must_not": [
        {
          "term": {
            "quote.keyword": "BTC"
          }
        },
        {
          "term": {
            "quote.keyword": "USDT"
          }
        }
      ],
      "should": [
        {
          "match_all": {}
        }
      ]
    }
  },
  "from": 0,
  "size": 10,
  "sort": [],
  "aggs": {}
}
'








// PRODUCTION

curl -X PUT "http://178.128.190.197:9200/hitbtc_candles" -H 'Content-Type: application/json' -d'
{
	"settings" : {
        "index" : {
            "number_of_shards" : 5,
            "number_of_replicas" : 0
        }
    },
	"mappings": {
		"prev_close": {
			"properties": {
				"base": {
					"type": "text",
					"fields": {
						"keyword": {
							"type": "keyword",
							"ignore_above": 256
						}
					}
				},
				"close": {
					"type": "float"
				},
				"method": {
					"type": "text",
					"fields": {
						"keyword": {
							"type": "keyword",
							"ignore_above": 256
						}
					}
				},
				"pairing": {
					"type": "text",
					"fields": {
						"keyword": {
							"type": "keyword",
							"ignore_above": 256
						}
					}
				},
				"percent_change": {
					"type": "float_range"
				},
				"percent_drop": {
					"type": "float_range"
				},
				"percent_rise": {
					"type": "float_range"
				},
				"quote": {
					"type": "text",
					"fields": {
						"keyword": {
							"type": "keyword",
							"ignore_above": 256
						}
					}
				},
				"sequence": {
					"type": "long"
				},
				"symbol": {
					"type": "text",
					"fields": {
						"keyword": {
							"type": "keyword",
							"ignore_above": 256
						}
					}
				},
				"timestamp": {
					"type": "long"
				},
				"volume_base_24hr": {
					"type": "long_range"
				},
				"volume_quote_24hr": {
					"type": "float_range"
				},
				"volume_quote_24hr_usd": {
					"type": "float_range"
				},
				"quote_values": {
					"type": "object"
				}
			}
		}
	}
}
'


curl -X POST "localhost:9200/test/_doc/8/_update" -H 'Content-Type: application/json' -d'

'

curl -X POST  "localhost:9200/test/_doc/8/_update" -H 'Content-Type: application/json' -d '{

    "scripted_upsert":true,

    "script" : {

        "id": "8",

        "params" : {

            "pageViewEvent" : {

                "url":"foo.com/bar",

                "response":404,

                "time":"2014-01-01 12:32"

            }

        }

    },

    "upsert" : {}

}'


curl -X GET "http://178.128.190.197:9200/hitbtc_scanner/_mappings"