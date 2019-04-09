function restrict (val, min, max) {

	return val > max ? max : val < min ? min : val

}

const simple = function (interval, sum_field, window, predict) {

	const moving_avg = {
		buckets_path: 'the_sum',
		window: window,
		model: 'simple'
	}

	if (predict && predict > 0) {
		moving_avg.predict = predict
	}

	return {
		size: 0,
		aggs: {
			my_date_histo: {
				date_histogram: {
					field: 'date',
					interval: `${interval}m`
				},
				aggs: {
					the_sum: {
						sum: {field: sum_field}
					},
					the_movavg: {
						moving_avg: moving_avg
					}
				}
			}
		}
	}
}

const linear = function (interval, sum_field, window, predict) {

	const moving_avg = {
		buckets_path: 'the_sum',
		window: window,
		model: 'linear'
	}

	if (predict && predict > 0) {
		moving_avg.predict = predict
	}

	return {
		size: 0,
		aggs: {
			my_date_histo: {
				date_histogram: {
					field: 'date',
					interval: `${interval}m`
				},
				aggs: {
					the_sum: {
						sum: {field: sum_field}
					},
					the_movavg: {
						moving_avg: moving_avg
					}
				}
			}
		}
	}
}

const ewma = function (interval, sum_field, window, predict, minimize, settings) {

	const moving_avg = {
		buckets_path: 'the_sum',
		window: window,
		model: 'ewma',
		minimize: minimize || false,
		settings: {
			alpha: restrict(settings.alpha, 0, 1) || 0.3
		}
	}

	if (predict && predict > 0) {
		moving_avg.predict = predict
	}

	return {
		size: 0,
		aggs: {
			my_date_histo: {
				date_histogram: {
					field: 'date',
					interval: `${interval}m`
				},
				aggs: {
					the_sum: {
						sum: {field: sum_field}
					},
					the_movavg: {
						moving_avg: moving_avg
					}
				}
			}
		}
	}
}

const holt_linear = function (interval, sum_field, window, predict, minimize, settings) {

	const moving_avg = {
		buckets_path: 'the_sum',
		window: window,
		model: 'holt',
		minimize: minimize || false,
		settings: {
			alpha: restrict(settings.alpha, 0, 1) || 0.3,
			beta: restrict(settings.beta, 0, 1) || 0.1
		}
	}

	if (predict && predict > 0) {
		moving_avg.predict = predict
	}

	return {
		size: 0,
		aggs: {
			my_date_histo: {
				date_histogram: {
					field: 'date',
					interval: `${interval}m`
				},
				aggs: {
					the_sum: {
						sum: {field: sum_field}
					},
					the_movavg: {
						moving_avg: moving_avg
					}
				}
			}
		}
	}
}

const holt_winters_add = function (interval, sum_field, window, predict, minimize, settings) {

	const moving_avg = {
		buckets_path: 'the_sum',
		window: window,
		model: 'holt_winters',
		minimize: minimize || true,
		settings: {
			type: 'add',
			alpha: restrict(settings.alpha, 0, 1) || 0.3,
			beta: restrict(settings.beta, 0, 1) || 0.1,
			gamma: restrict(settings.gamma, 0, 1) || 0.3,
			period: restrict(settings.alpha, 1, 1440) || 1
		}
	}

	if (predict && predict > 0) {
		moving_avg.predict = predict
	}

	return {
		size: 0,
		aggs: {
			my_date_histo: {
				date_histogram: {
					field: 'date',
					interval: `${interval}m`
				},
				aggs: {
					the_sum: {
						sum: {field: sum_field}
					},
					the_movavg: {
						moving_avg: moving_avg
					}
				}
			}
		}
	}
}

const holt_winters_multi = function (interval, sum_field, window, predict, minimize, settings) {

	const moving_avg = {
		buckets_path: 'the_sum',
		window: window,
		model: 'holt_winters',
		minimize: minimize || true,
		settings: {
			type: 'mult',
			alpha: restrict(settings.alpha, 0, 1) || 0.3,
			beta: restrict(settings.beta, 0, 1) || 0.1,
			gamma: restrict(settings.gamma, 0, 1) || 0.3,
			period: restrict(settings.alpha, 1, 1440) || 1,
			pad: settings.pad
		}
	}

	if (predict && predict > 0) {
		moving_avg.predict = predict
	}

	return {
		size: 0,
		aggs: {
			my_date_histo: {
				date_histogram: {
					field: 'date',
					interval: `${interval}m`
				},
				aggs: {
					the_sum: {
						sum: {field: sum_field}
					},
					the_movavg: {
						moving_avg: moving_avg
					}
				}
			}
		}
	}
}

const all_settings = function () {

	return {
		holt_winters_multi: {
			alpha: {
				default: 0.3,
				min: 0,
				max: 1
			},
			beta: {
				default: 0.1,
				min: 0,
				max: 1
			},
			gamma: {
				default: 0.3,
				min: 0,
				max: 1
			},
			period: {
				default: 1,
				min: 1,
				max: 1440
			},
			pad: {
				default: true
			}
		},
		hot_winters_add: {
			alpha: {
				default: 0.3,
				min: 0,
				max: 1
			},
			beta: {
				default: 0.1,
				min: 0,
				max: 1
			},
			gamma: {
				default: 0.3,
				min: 0,
				max: 1
			},
			period: {
				default: 1,
				min: 1,
				max: 1440
			}
		},
		holt_linear: {
			alpha: {
				default: 0.3,
				min: 0,
				max: 1
			},
			beta: {
				default: 0.1,
				min: 0,
				max: 1
			}
		},
		ewma: {
			alpha: {
				default: 0.3,
				min: 0,
				max: 1
			}
		}
	}

}

const settings = function (model) {
	const all_settings = all_settings()
	return all_settings[model]
}

const info = function (model) {
	const url = `https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-movavg-aggregation.html`

	const models = {
		simple: '#_simple',
		linear: '#_linear',
		ewma: '#_ewma_exponentially_weighted',
		holt_linear: '#_holt_linear',
		holt_winters: '#_holt_winters',
		prediction: '#_prediction',
		minimization: '#movavg-minimizer'
	}

	return `${url}${models[model]}`
}

export function ___moving_avg () {
	return {
		aggs: {
			simple: {
				method: simple,
				args: ['interval', 'sum_field', 'window', 'predict'],
				settings: {},
				info: info('simple')
			},
			linear: {
				method: linear,
				args: ['interval', 'sum_field', 'window', 'predict'],
				settings: {},
				info: info('linear')
			},
			ewma: {
				method: ewma,
				args: ['interval', 'sum_field', 'window', 'predict', 'minimize', 'settings'],
				settings: settings('ewma'),
				info: info('ewma')
			},
			holt_linear: {
				method: holt_linear,
				args: ['interval', 'sum_field', 'window', 'predict', 'minimize', 'settings'],
				settings: settings('holt_linear'),
				info: info('holt_linear')
			},
			holt_winters_add: {
				method: holt_winters_add,
				args: ['interval', 'sum_field', 'window', 'predict', 'minimize', 'settings'],
				settings: settings('holt_winters_add'),
				info: info('holt_winters')
			},
			holt_winters_multi: {
				method: holt_winters_multi,
				settings: settings('holt_winters_multi'),
				info: info('holt_winters')
			},

		},
		all_settings: {
			method: all_settings,
			info: 'Settings grouped by MA model.'
		},
		tuners: {
			prediction: {
				info: info('prediction')
			},
			minimization: {
				info: info('minimization')
			},
		}
	}
}