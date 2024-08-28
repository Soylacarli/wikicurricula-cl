let wiki_link, dataFile;
let subject_file;
let subjects = ["all"];
 const starting_year = 2023;
function format_date(date) {
	if (date != 0) {
		const year = date.substring(0, 4);
		const month = date.substring(5, 7);
		const day = date.substring(8, 10);
		return day + "-" + month + "-" + year;
	} else {
		return "-";
	}
}

// detect when a user moves from one curricula to another
page = document.getElementsByTagName("html")[0];
const container = "#dv1";
const font_size = 10;
const filter_item = 120; // 120
const shiftx_article = 30;
const variation_line_opacity = 0.7;
const stroke_dash = "3,3";

// let multiply = 1;
let window_w = $(container).outerWidth();
window_h = $(container).outerHeight();

if (window_w <= 768) {
	reduction = 20;
} else {
	reduction = 0;
}

let margin = {
		top: 20,
		left: 0 - reduction,
		bottom: 20,
		right: 60 - reduction,
	},
	width = window_w - (margin.right + margin.right),
	height = window_h - (margin.top + margin.bottom);

// select div, append svg element to it, give it a width and height and id of svg
let svg = d3
	.select(container)
	.append("svg")
	.attr("width", width + (margin.right + margin.right))
	.attr("height", height + (margin.top + margin.bottom))
	.attr("id", "svg");

// improvements
let improvements_defs = svg.append("defs").append("g").attr("id", "icons");

let scale_icons = "0.5";

let improv_one = improvements_defs
	.append("g")
	.attr("id", "improv_one")
	.attr("transform", "scale(" + scale_icons + "),translate(5,-10)")
	.append("polygon")
	.attr("points", "5 0 0 7 10 7 5 0");

let improv_two = improvements_defs
	.append("g")
	.attr("id", "improv_two")
	.attr("transform", "scale(" + scale_icons + "),translate(5,-17)");

improv_two.append("polygon").attr("points", "5 0 0 7 10 7 5 0");

improv_two.append("polygon").attr("points", "5 7 0 14 10 14 5 7");

let improv_three = improvements_defs
	.append("g")
	.attr("id", "improv_three")
	.attr("transform", "scale(" + scale_icons + "),translate(5,-24)");

improv_three.append("polygon").attr("points", "5 0 0 7 10 7 5 0");

improv_three.append("polygon").attr("points", "5 7 0 14 10 14 5 7");

improv_three.append("polygon").attr("points", "5 14 0 21 10 21 5 14");

let improv_col = "black"; //"#1ba51b";
let improv_delay = 1800;

let random_subject = null;
let random_subject_index = null;
//If the visualization initializes with too many or too few articles the visualization renders too small or too big dots, which mess up with the visualization when changing to another subject
//...for that reason, some subjects should not be the first to load
let forbidden_subjects = ["Comunicación y sociedad"];
//...and Wikipedias with too few articles, should initialize at "all subjects"
let wikipedias_with_few_subjects = ["tw"]

const pageSelector = document.getElementById("pageSelector");
const selectedPage = pageSelector.value;


pageSelector.addEventListener("change", function () {
	const selectedPage = pageSelector.value;

	if (selectedPage === "uy") {
		window.location.href = "uy_es.html";
	} else if (selectedPage === "ghana_en") {
		window.location.href = "ghana_en.html";
	} else if (selectedPage === "ghana_tw") {
		window.location.href = "ghana_tw.html";
	} else if (selectedPage === "italy_it") {
		window.location.href = "italy_it.html";
	} else if (selectedPage === "cl") {
		window.location.href = "index.html";
	}		
});

function dv1(year, the_subject, sort) {
	// d3.tsv(`assets/data/${filename}` + year + ".tsv").then(loaded);
	d3.tsv(dataFile).then(loaded);
	function loaded(data) {
		// load data
		let total = 0;
		let subject_articles = [];
		let filter_data;

		let subject_group = d3
			.nest()
			.key((d) => d.subject.trim())
			.entries(data);
		console.log(subject_group);
		for (const [d, c] of Object.entries(subject_group)) {
			if (the_subject == "all") {
				if (c.key !== "") {
					let values = c.values;
					values.forEach(function (d, i) {
						subject_articles.push(d);
					});
				}
			} else {
				if (c.key == the_subject) {
					subject_articles = c.values;
				}
			}
		}

		visit_sort = subject_articles.sort(function (x, y) {
			return d3.descending(+x.avg_pv, +y.avg_pv);
		});

		filter_data = visit_sort.filter(function (x, y) {
			return y < filter_item;
		});

		// sort
		filtered_data = filter_data.sort(function (a, b) {
			return d3.ascending(a.article, b.article);
		});

		filtered_data.forEach(function (d, i) {
			total += 1;
			d.article = d.article.replace(/_/g, " ");
			d.size = +d.size;
			d.discussion_size = +d.discussion_size;
			d.incipit_size = +d.incipit_size;
			d.issues = +d.issues;
			d.images = +d.images;

			d.days = +d.days;
			d.avg_pv = +d.avg_pv;

			d.issues_prev = +d.issues_prev;
			d.images_prev = +d.images_prev;
			d.incipit_prev = +d.incipit_prev;
			d.issue_sourceNeeded = +d.issue_sourceNeeded;
			d.issues = +d.issues;
			d.issue_clarify = +d.issue_clarify;

			if (d.avg_pv_prev !== "-") {
				d.avg_pv_prev = +d.avg_pv_prev;
			}

			// improvements
			d.improvements = 0;
			if (d.issues < d.issues_prev) {
				d.improvements += 1;
			}
			if (d.images > d.images_prev) {
				d.improvements += 1;
			}
			if (d.incipit_size > d.incipit_prev) {
				d.improvements += 1;
			}

			if (d.improvements > 0) {
				console.log(
					d.article,
					d.improvements,
					d.issues,
					d.issues_prev,
					d.images,
					d.images_prev,
					d.incipit_size,
					d.incipit_prev,
					d.issue_clarify,
					d.issue_sourceNeeded,
					d.issues
				);
			}
		});
		// console.log(filtered_data);

		// scale
		let y_max = d3.max(filtered_data, function (d) {
			return +d.avg_pv;
		});
		let x_max = d3.max(filtered_data, function (d) {
			return +d.first_edit;
		});
		// console.log("x_max"+ x_max)

		let r_max = d3.max(filtered_data, function (d) {
			return Math.sqrt(+d.size / 3.14);
		});

		let y = d3
			.scaleLinear()
			.domain([0, y_max + (y_max / 100) * 10])
			.range([height - margin.top, 0]);

		let x_ScaleTime = d3
			.scaleTime()
			.domain(
				d3.extent(filtered_data, function (d) {
					return new Date(d.first_edit);
				})
			)
			.range([0, width]);

		if (sort == 1) {
			max = total;
			min = 0;
		} else if (sort == 2) {
			max = d3.min(filtered_data, function (d) {
				return d.days;
			});
			min = d3.max(filtered_data, function (d) {
				return d.days;
			});
		} else if (sort == 3) {
			min = d3.min(filtered_data, function (d) {
				return d.size;
			});
			max = d3.max(filtered_data, function (d) {
				return d.size;
			});
		} else if (sort == 4) {
			min = d3.min(filtered_data, function (d) {
				return d.discussion_size;
			});
			max = d3.max(filtered_data, function (d) {
				return d.discussion_size;
			});
		} else if (sort == 5) {
			min = d3.min(filtered_data, function (d) {
				return d.incipit_size;
			});
			max = d3.max(filtered_data, function (d) {
				return d.incipit_size;
			});
		} else if (sort == 6) {
			min = 0;
			max = d3.max(filtered_data, function (d) {
				return d.issues;
			});
		} else if (sort == 7) {
			min = d3.min(filtered_data, function (d) {
				return d.images;
			});
			max = d3.max(filtered_data, function (d) {
				return d.images;
			});
		} else if (sort == 8) {
			min = d3.min(filtered_data, function (d) {
				return d.notes;
			});
			max = d3.max(filtered_data, function (d) {
				return d.notes;
			});
		}

		x = d3
			.scaleLinear()
			.domain([min, max])
			.range([0, width - 100]);
		// console.log(min,max)

		let r = d3.scaleLinear().range([0, 20]).domain([0, r_max]);

		// axis and grid
		let grid = svg
			.append("g")
			.attr("id", "grid")
			.attr("transform", "translate(-1," + margin.top * 2 + ")")
			.call(
				make_y_gridlines().tickSize(
					-width - margin.left - margin.right - 60
				)
			);

		let plot = svg
			.append("g")
			.attr("id", "d3_plot")
			.attr(
				"transform",
				"translate(" + margin.right + "," + margin.top + ")"
			);

		function make_y_gridlines() {
			return d3.axisLeft(y);
		}

		let yAxis_margin = 10;
		if (window_w < 700) {
			yAxis_margin = 0;
		}
		let yAxis = plot
			.append("g")
			.attr("id", "yAxis")
			.attr(
				"transform",
				"translate(" + yAxis_margin + "," + margin.top + ")"
			)
			.call(d3.axisLeft(y))
			.selectAll("text")
			.attr("y", -10);

		let yaxis_label_box = plot
			.append("g")
			.attr("class", "yaxis_label")
			.attr("transform", "translate(7," + height + ")");

		let yaxis_label = yaxis_label_box
			.append("text")
			.text("Daily visits (average)")
			.attr("y", -6)
			.attr("font-size", font_size);

		//========== X axis ======

		function updateXScale(selectedValue) {
			// console.log("sv== " + selectedValue)

			d3.select("#datexAxis").remove();
			d3.select("#xAxis").remove();

			if (selectedValue == 1) {
				var values = filtered_data.map(function (d) {
					return d.article;
				});
			} else if (selectedValue == 2) {
				dateXAxis();
			} else if (selectedValue == 3) {
				var values = filtered_data.map(function (d) {
					return +d.size;
				});
			} else if (selectedValue == 4) {
				var values = filtered_data.map(function (d) {
					return +d.discussion_size;
				});
			} else if (selectedValue == 5) {
				var values = filtered_data.map(function (d) {
					return +d.incipit_size;
				});
			} else if (selectedValue == 6) {
				var values = filtered_data.map(function (d) {
					return +d.issues;
				});
			} else if (selectedValue == 7) {
				var values = filtered_data.map(function (d) {
					return +d.images;
				});
			} else if (selectedValue == 8) {
				var values = filtered_data.map(function (d) {
					return +d.notes;
				});
			}

			// console.log("val == " +values)
			var xSacle = d3
				.scaleLinear()
				.domain([0, d3.max(values)])
				.range([0, width + 50]);

			var xAxisGenerator = d3.axisBottom(xSacle);

			let xAxis = plot
				.append("a")
				.attr("id", "xAxis")
				.call(xAxisGenerator)
				.attr("transform", `translate(${0},${height})`);
		}

		function dateXAxis() {
			let x_ScaleTime = d3
				.scaleTime()
				.domain(
					d3.extent(filtered_data, function (d) {
						return new Date(d.first_edit);
					})
				)
				.range([0, width + 50]);

			var xAxisGenerator = d3.axisBottom(x_ScaleTime);

			let xAxis = plot
				.append("a")
				.attr("id", "datexAxis")
				.call(xAxisGenerator)
				.attr("transform", `translate(${0},${height})`);
		}

		var initialSelectedColumn = "1";
		updateXScale(initialSelectedColumn);

		d3.select("#sort").on("change", function () {
			var selectedValue = d3.select(this).property("value");
			updateXScale(selectedValue);
		});

		//========  X axis =======

		// let the_sort;
		let tooltip = d3
			.tip()
			.attr("class", "tooltip")
			.attr("id", "tooltip_dv1")
			.direction(function (d, i) {
				return "n";
			})
			.offset([-10, 0])
			.html(function (d, i) {
				let lang = 'en'; // Default language is set to English
		
				// Check if 'lang' parameter is present in the URL
				let params = new URLSearchParams(window.location.search);
				if (params.has('lang') == true) {
					lang = params.get('lang')
				}
				let translationKeys = [
					'grade', 'subject', 'publication', 'visits', 'size', 'discussion', 'introduction',
					'references', 'issues', 'source_needed', 'need_clarification', 'images'
				];

				// Translate the keys using the loaded translations
				let translationsForLang = translations[lang] || translations['en']; // Default to English if the language is not available
				let translatedKeys = translationKeys.map(key => translationsForLang[key] || key);
	
				
				let content =
					"<p style='font-weight: bold; margin: 0 0 10px 3px;'>" +
					d.article +
					"</p><table>";
				content +=
					"<tr><td class='label'>"+translatedKeys[0]+"</td><td class='value'>" +
					// d.grade.toLocaleString() +
					"</td><td></td></tr>";
				content +=
					"<tr><td class='label'>"+translatedKeys[1]+"</td><td class='value'>" +
					d.subject.toLocaleString() +
					"</td><td></td></tr>";
				content +=
					"<tr><td class='label'>"+translatedKeys[2]+"</td><td class='value'>" +
					format_date(d.first_edit) +
					"</td><td></td></tr>";
				// avg daily visits
				content +=
					"<tr><td class='label'>"+translatedKeys[3]+"</td><td class='value'>" +
					d.avg_pv.toLocaleString();
				if (d.avg_pv_prev !== "-") {
					let diff_pv = d.avg_pv - d.avg_pv_prev;
					if (diff_pv > 0) {
						content +=
							"<td class='value increase'>(" +
							/*d.avg_pv_prev + " " + */ variation_perc(
								d.avg_pv,
								d.avg_pv_prev,
								"visits"
							) +
							")</td></tr>";
					} else {
						let diff_pv_perc = Math.floor(
							100 - (d.avg_pv * 100) / d.avg_pv_prev
						).toLocaleString();
						content +=
							"<td class='value decrease'>(" +
							/* d.avg_pv_prev + " " + */ variation_perc(
								d.avg_pv,
								d.avg_pv_prev,
								"visits"
							) +
							")</td></tr>";
					}
				}

				//size
				content +=
					"<tr><td class='label'>"+translatedKeys[4]+"</td><td class='value'>" +
					d.size.toLocaleString();
				if (year != starting_year) {
					let diff_size = d.size - d.size_prev;
					if (diff_size > 0) {
						content +=
							"<td class='value increase'>(" +
							/* d.size_prev + " " + */ variation_perc(
								d.size,
								d.size_prev,
								"visits"
							) +
							")</td></tr>";
					} else {
						content +=
							"<td class='value decrease'>(" +
							/* d.size_prev + " " + */ variation_perc(
								d.size,
								d.size_prev,
								"visits"
							) +
							")</td></tr>";
					}
				}

				// discussion
				content +=
					"<tr><td class='label'>"+translatedKeys[5]+"</td><td class='value'>" +
					d.discussion_size.toLocaleString();
				if (year != starting_year) {
					let diff_discussion = d.discussion_size - d.discussion_prev;
					if (diff_discussion > 0) {
						content +=
							"<td class='value increase'>(" +
							/* d.discussion_prev + " " + */ variation_perc(
								d.discussion_size,
								d.discussion_prev,
								"discussion"
							) +
							")</td></tr>";
					} else {
						content +=
							"<td class='value decrease'>(" +
							/* d.discussion_prev + " " + */ variation_perc(
								d.discussion_size,
								d.discussion_prev,
								"discussion"
							) +
							")</td></tr>";
					}
				}

				// introduction
				content +=
					"<tr><td class='label'>"+translatedKeys[6]+"</td><td class='value'>" +
					d.incipit_size.toLocaleString();
				if (year != starting_year) {
					let diff_incipit = d.incipit_size - d.incipit_prev;
					if (diff_incipit > 0) {
						content +=
							"<td class='value increase'>(" +
							/* d.incipit_prev + " " + */ variation_perc(
								d.incipit_size,
								d.incipit_prev,
								"incipit"
							) +
							")</td></tr>";
					} else {
						content +=
							"<td class='value decrease'>(" +
							/* d.incipit_prev + " " + */ variation_perc(
								d.incipit_size,
								d.incipit_prev,
								"incipit"
							) +
							")</td></tr>";
					}
				}

				// references
				content +=
					"<tr><td class='label'>"+translatedKeys[7]+"</td><td class='value'>" +
					d.notes.toLocaleString();
				if (year != starting_year) {
					let diff_notes = d.notes - d.notes_prev;
					if (diff_notes > 0) {
						content +=
							"<td class='value decrease'>(" +
							/* d.notes_prev + " " + */ variation_perc(
								d.notes,
								d.notes_prev,
								"notes"
							) +
							")</td></tr>";
					} else {
						content +=
							"<td class='value increase'>(" +
							/* d.notes_prev + " " + */ variation_perc(
								d.notes,
								d.notes_prev,
								"notes"
							) +
							")</td></tr>";
					}
				}

				// issues
				content +=
					"<tr><td class='label'>"+translatedKeys[8]+"</td><td class='value'>" +
					d.issues.toLocaleString();
				if (year != starting_year) {
					let diff_issues = d.issues - d.issues_prev;
					if (diff_issues > 0) {
						content +=
							"<td class='value decrease'>(" +
							/* d.issues_prev + " " + */ variation_perc(
								d.issues,
								d.issues_prev,
								"issues"
							) +
							")</td></tr>";
					} else {
						content +=
							"<td class='value increase'>(" +
							/* d.issues_prev + " " + */ variation_perc(
								d.issues,
								d.issues_prev,
								"issues"
							) +
							")</td></tr>";
					}
				}

				// source needed
				content +=
					"<tr><td class='label'>"+translatedKeys[9]+"</td><td class='value'>" +
					d.issue_sourceNeeded;
				+"</td><td></td></tr>";

				// need clarification
				content +=
					"<tr><td class='label'>"+translatedKeys[10]+"</td><td class='value'>" +
					d.issue_clarify;
				+"</td><td></td></tr>";

				// images
				content +=
					"<tr><td class='label'>"+translatedKeys[11]+"</td><td class='value'>" +
					d.images.toLocaleString();
				if (year != starting_year) {
					let diff_images = d.images - d.images_prev;
					if (diff_images > 0) {
						content +=
							"<td class='value increase'>(" +
							/* d.images_prev + " " + */ variation_perc(
								d.images,
								d.images_prev,
								"images"
							) +
							")</td></tr>";
					} else {
						content +=
							"<td class='value decrease'>(" +
							/* d.images_prev + " " + */ variation_perc(
								d.images,
								d.images_prev,
								"images"
							) +
							")</td></tr>";
					}
				}

				content += "</table>";
				return content;
				//});
			});
		plot.call(tooltip);

		// plot data
		let articles = plot
			.append("g")
			.attr("id", "articles")
			.attr(
				"transform",
				"translate(" + shiftx_article + "," + margin.top + ")"
			);

		let article = articles
			.selectAll("g")
			.data(filtered_data)
			.enter()
			.append("g")
			.attr("class", "article")
			.attr("id", function (d, i) {
				return i;
			})
			.attr("data-article", function (d, i) {
				return d.article;
			})
			.attr("transform", function (d, i) {
				if (sort == 1) {
					return "translate(" + (x(i) + 50) + ",0)";
				} else if (sort == 2) {
					return "translate(" + (x(d.days) + 50) + ",0)";
				} else if (sort == 3) {
					return "translate(" + (x(d.size) + 50) + ",0)";
				} else if (sort == 4) {
					return "translate(" + (x(d.discussion_size) + 50) + ",0)";
				} else if (sort == 5) {
					return "translate(" + (x(d.incipit_size) + 50) + ",0)";
				} else if (sort == 6) {
					return "translate(" + (x(d.issues) + 50) + ",0)";
				} else if (sort == 7) {
					return "translate(" + (x(d.images) + 50) + ",0)";
				}
			})
			.on("mouseover", tooltip.show)
			.on("mouseout", tooltip.hide);

		// variation 2020-2021
		let variation = article
			.append("g")
			.attr("class", "variation")
			.attr("transform", function (d, i) {
				if (d.avg_pv_prev !== "-") {
					return "translate(" + 0 + "," + y(d.avg_pv_prev) + ")";
				} else {
					return "translate(0,0)";
				}
			});

		let variation_line = variation
			.append("line")
			.attr("class", "line_prev")
			.attr("opacity", variation_line_opacity)
			.attr("stroke", function (d, i) {
				return apply_color(d.subject);
			})
			.style("stroke-dasharray", stroke_dash)
			.attr("x1", function (d, i) {
				return 0;
			})
			.attr("y1", function (d, i) {
				return 0;
			})
			.attr("x2", function (d, i) {
				return 0;
			})
			.attr("y2", function (d, i) {
				if (d.avg_pv_prev !== "-") {
					return y(d.avg_pv) - y(d.avg_pv_prev);
				} else {
					return 0;
				}
			});

		let variation_circle = variation
			.append("circle")
			.attr("cx", 0)
			.attr("cy", function (d, i) {
				if (d.avg_pv_prev !== "-") {
					return y(d.avg_pv) - y(d.avg_pv_prev);
				} else {
					return 0;
				}
			})
			.attr("class", "circle_prev")
			.attr("opacity", 0)
			.attr("stroke", function (d, i) {
				return apply_color(d.subject);
			})
			.style("stroke-dasharray", stroke_dash)
			.attr("fill", "transparent")
			.attr("r", function (d, i) {
				return r(Math.sqrt(d.size_prev / 3.14));
			});

		// articles
		let article_circles = article
			.append("g")
			.attr("class", "article_circles")
			.attr("transform", function (d, i) {
				return "translate(" + 0 + "," + y(+d.avg_pv) + ")";
			})
			.on("mouseover", handleMouseOver)
			.on("mouseout", handleMouseOut)
			.append("a")
			.attr("xlink:href", function (d, i) {
				return wiki_link + d.article;
			})
			.attr("target", "_blank");

		let circles = article_circles
			.append("circle")
			.transition()
			.duration(500)
			.delay(function (d, i) {
				return i * 2;
			})
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("fill", function (d, i) {
				return apply_color(d.subject);
			})
			.attr("opacity", 0.5)
			.attr("r", 0)
			.transition()
			.ease(d3.easeLinear)
			.duration(500)
			.attr("r", function (d, i) {
				return r(Math.sqrt(d.size / 3.14));
			})
			.attr("data-size", function (d, i) {
				return d.size;
			});

		let incipit = article_circles
			.append("circle")
			.transition()
			.duration(500)
			.delay(function (d, i) {
				return i * 2;
			})
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("fill", function (d, i) {
				return apply_color(d.subject);
			})
			.attr("opacity", 0.5)
			.attr("r", function (d, i) {
				return r(Math.sqrt(d.incipit_size / 3.14));
			})
			.attr("data-incipit", function (d, i) {
				return d.incipit_size;
			});

		let discussion = article_circles
			.append("circle")
			.transition()
			.duration(500)
			.delay(function (d, i) {
				return i * 2;
			})
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("stroke", function (d, i) {
				return apply_color(d.subject);
			})
			.attr("fill", "transparent")
			.attr("stroke-width", 0.5)
			.attr("opacity", 0.9)
			.attr("r", 0)
			.transition()
			.delay(500)
			.ease(d3.easeLinear)
			.duration(500)
			.attr("r", function (d, i) {
				return r(Math.sqrt(d.discussion_size / 3.14));
			});

		// improvements
		let improvements_box = article_circles
			.append("g")
			.attr("class", "improvements")
			.attr("data-improvements", function (d, i) {
				return d.improvements;
			});

		let improvements = improvements_box
			.append("g")
			.append("use")
			.attr("xlink:href", function (d, i) {
				if (d.improvements == 1) {
					return "#improv_one";
				} else if (d.improvements == 2) {
					return "#improv_two";
				} else if (d.improvements == 3) {
					return "#improv_three";
				}
			})
			.attr("transform", function (d, i) {
				return "translate(-5,-" + r(Math.sqrt(d.size / 3.14)) + ")";
			})
			.attr("stroke", "none")
			.attr("fill", function (d, i) {
				if (d.improvements > 0) {
					return improv_col;
				} else {
					return "none";
				}
			})
			.attr("opacity", 0)
			.transition()
			.delay(improv_delay)
			.attr("opacity", 1);

		// let improvement_debug = improvements_box.append("circle")
		// 	.attr("cx",0)
		// 	.attr("cy",0)
		// 	.attr("r",30)
		//           .attr("fill", "none")
		//           .attr("stroke", function (d,i) {
		//           	if (d.improvements > 0) {
		//           		return improv_col
		//           	}
		//           	else {
		//           		return "none"
		//           	}
		//           })

		function handleMouseOver() {
			// hide circles
			d3.selectAll(".article_circles").attr("opacity", 0.2);

			d3.selectAll(".variation")
				.select(".line_prev")
				.attr("opacity", 0.2);

			d3.selectAll(".variation")
				.select(".circle_prev")
				.attr("opacity", 0);

			// highlight
			d3.select(this).attr("opacity", 1);

			d3.select(this.previousSibling)
				.select(".circle_prev")
				.attr("opacity", 1);

			d3.select(this.previousSibling)
				.select(".line_prev")
				.attr("opacity", 1);
		}

		function handleMouseOut() {
			d3.selectAll(".article_circles").attr("opacity", 1);

			d3.selectAll(".variation")
				.select(".circle_prev")
				.attr("opacity", 0);

			d3.selectAll(".variation")
				.select(".line_prev")
				.attr("opacity", variation_line_opacity);
		}

		$("#subjects").change(function () {
			let subject = this.value;
			new_sort = $("#sort option:selected").val();

			update_subject(subject, new_sort);
		});

		$("#sort").change(function () {
			new_sort = parseInt(this.value);
			let subject = $("#subjects option:selected").val();

			update_sort(subject, new_sort);
		});

		function update_subject(the_subject, the_sort) {
			d3.select("#articles").remove();

			d3.select("#datexAxis").remove();
			d3.select("#xAxis").remove();

			if (the_sort == 2) {
				dateXAxis();
			} else {
				d3.select("#datexAxis").remove();
				updateXScale(the_sort);
			}

			d3.selectAll("circle").transition().duration(300).attr("r", 0);

			// load data
			total = 0;

			let subject_articles = [];
			let visit_sort;
			let filter_data;

			let subject_group = d3
				.nest()
				.key((d) => d.subject)
				.entries(data);

			for (const [d, c] of Object.entries(subject_group)) {
				if (the_subject == "all") {
					if (c.key !== "-") {
						let values = c.values;

						values.forEach(function (d, i) {
							subject_articles.push(d);
						});
					}
				} else {
					if (c.key == the_subject) {
						subject_articles = c.values;
					}
				}
			}

			visit_sort = subject_articles.sort(function (x, y) {
				return d3.descending(+x.avg_pv, +y.avg_pv);
			});

			filter_data = visit_sort.filter(function (x, y) {
				return y < filter_item;
			});

			filtered_data = filter_data.sort(function (a, b) {
				return d3.ascending(a.article, b.article);
			});

			filtered_data.forEach(function (d, i) {
				total += 1;
				d.article = d.article.replace(/_/g, " ");
				d.size = +d.size;
				d.discussion_size = +d.discussion_size;
				d.incipit_size = +d.incipit_size;
				d.issues = +d.issues;
				d.images = +d.images;
				d.issue_clarify = +d.issue_clarify;
				d.issue_sourceNeeded = +d.issue_sourceNeeded;
				d.notes = +d.notes;
				d.days = +d.days;
				d.avg_pv = +d.avg_pv;

				d.issues_prev = +d.issues_prev;
				d.images_prev = +d.images_prev;
				d.incipit_prev = +d.incipit_prev;

				if (d.avg_pv_prev !== "-") {
					d.avg_pv_prev = +d.avg_pv_prev;
				}

				// improvements
				d.improvements = 0;
				if (d.issues < d.issues_prev) {
					d.improvements += 1;
				}
				if (d.images > d.images_prev) {
					d.improvements += 1;
				}
				if (d.incipit_size > d.incipit_prev) {
					d.improvements += 1;
				}

				if (d.improvements > 0) {
					console.log(
						d.article,
						d.improvements,
						d.issues,
						d.issues_prev,
						d.images,
						d.images_prev,
						d.incipit_size,
						d.incipit_prev
					);
				}
			});

			// scale
			y_max = d3.max(filtered_data, function (d) {
				return +d.avg_pv;
			});

			y = d3
				.scaleLinear()
				.domain([0, y_max + (y_max / 100) * 10])
				.range([height - margin.top, 0]);

			if (the_sort == 1) {
				max = total;
				min = 0;
			} else if (the_sort == 2) {
				min = d3.max(filtered_data, function (d) {
					return d.days;
				});
				max = d3.min(filtered_data, function (d) {
					return d.days;
				});
			} else if (the_sort == 3) {
				min = d3.min(filtered_data, function (d) {
					return d.size;
				});
				max = d3.max(filtered_data, function (d) {
					return d.size;
				});
			} else if (the_sort == 4) {
				min = d3.min(filtered_data, function (d) {
					return d.discussion_size;
				});
				max = d3.max(filtered_data, function (d) {
					return d.discussion_size;
				});
			} else if (the_sort == 5) {
				min = d3.min(filtered_data, function (d) {
					return d.incipit_size;
				});
				max = d3.max(filtered_data, function (d) {
					return d.incipit_size;
				});
			} else if (the_sort == 6) {
				min = 0;
				max = d3.max(filtered_data, function (d) {
					return d.issues;
				});
			} else if (the_sort == 7) {
				min = d3.min(filtered_data, function (d) {
					return d.images;
				});
				max = d3.max(filtered_data, function (d) {
					return d.images;
				});
			} else if (the_sort == 8) {
				min = d3.min(filtered_data, function (d) {
					return d.notes;
				});
				max = d3.max(filtered_data, function (d) {
					return d.notes;
				});
			}

			x = d3
				.scaleLinear()
				.domain([min, max])
				.range([0, width - 100]);

			function make_y_gridlines() {
				return d3.axisLeft(y);
			}

			svg.select("#yAxis")
				.transition()
				.call(d3.axisLeft(y))
				.selectAll("text")
				.attr("y", -10);

			svg.select("#grid")
				.transition()
				.call(
					make_y_gridlines().tickSize(
						-width - margin.left - margin.right - 60
					)
				);

			let yaxis_label_box = d3
				.selectAll(".tick:nth-child(1)")
				.select("text")
				.attr("fill", "red");

			let articles = plot
				.append("g")
				.attr("id", "articles")
				.attr(
					"transform",
					"translate(" + shiftx_article + "," + margin.top + ")"
				);

			let article = articles
				.selectAll("g")
				.data(filtered_data)
				.enter()
				.append("g")
				.attr("class", "article")
				.attr("id", function (d, i) {
					return i;
				})
				.attr("data-article", function (d, i) {
					return d.article;
				})
				.attr("transform", function (d, i) {
					if (the_sort == 1) {
						// "article"
						return "translate(" + (x(i) + 50) + "," + 0 + ")";
					} else if (the_sort == 2) {
						// "publication"
						return "translate(" + (x(+d.days) + 50) + "," + 0 + ")";
					} else if (the_sort == 3) {
						// "size"
						return "translate(" + (x(+d.size) + 50) + "," + 0 + ")";
					} else if (the_sort == 4) {
						// "discussion"
						return (
							"translate(" +
							(x(+d.discussion_size) + 50) +
							"," +
							0 +
							")"
						);
					} else if (the_sort == 5) {
						return (
							"translate(" +
							(x(+d.incipit_size) + 50) +
							"," +
							0 +
							")"
						);
					} else if (the_sort == 6) {
						// "issue"
						return (
							"translate(" + (x(+d.issues) + 50) + "," + 0 + ")"
						);
					} else if (the_sort == 7) {
						// "images"
						return (
							"translate(" + (x(+d.images) + 50) + "," + 0 + ")"
						);
					} else if (the_sort == 8) {
						// "refrences"
						return (
							"translate(" + (x(+d.notes) + 50) + "," + 0 + ")"
						);
					}
				})
				.on("mouseover", tooltip.show)
				.on("mouseout", tooltip.hide);

			// variation 2020-2021
			let variation = article
				.append("g")
				.attr("class", "variation")
				.attr("transform", function (d, i) {
					if (d.avg_pv_prev !== "-") {
						return "translate(" + 0 + "," + y(d.avg_pv_prev) + ")";
					} else {
						return "translate(0,0)";
					}
				});

			let variation_line = variation
				.append("line")
				.attr("class", "line_prev")
				.attr("opacity", variation_line_opacity)
				.attr("stroke", function (d, i) {
					return apply_color(d.subject);
				})
				.style("stroke-dasharray", stroke_dash)
				.attr("x1", function (d, i) {
					return 0;
				})
				.attr("y1", function (d, i) {
					return 0;
				})
				.attr("x2", function (d, i) {
					return 0;
				})
				.attr("y2", function (d, i) {
					if (d.avg_pv_prev !== "-") {
						return y(d.avg_pv) - y(d.avg_pv_prev);
					} else {
						return 0;
					}
				});

			let variation_circle = variation
				.append("circle")
				.attr("cx", 0)
				.attr("cy", function (d, i) {
					if (d.avg_pv_prev !== "-") {
						return y(d.avg_pv) - y(d.avg_pv_prev);
					} else {
						return 0;
					}
				})
				.attr("class", "circle_prev")
				.attr("opacity", 0)
				.attr("stroke", function (d, i) {
					return apply_color(d.subject);
				})
				.style("stroke-dasharray", stroke_dash)
				.attr("fill", "transparent")
				.attr("r", function (d, i) {
					return r(Math.sqrt(d.size_prev / 3.14));
				});

			// articles
			let article_circles = article
				.append("g")
				.attr("class", "article_circles")
				.attr("transform", function (d, i) {
					return "translate(" + 0 + "," + y(+d.avg_pv) + ")";
				})
				.on("mouseover", handleMouseOver)
				.on("mouseout", handleMouseOut)
				.append("a")
				.attr("xlink:href", function (d, i) {
					return wiki_link + d.article;
				})
				.attr("target", "_blank");

			let circles = article_circles
				.append("circle")
				.transition()
				.duration(500)
				.delay(function (d, i) {
					return i * 2;
				})
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("fill", function (d, i) {
					return apply_color(d.subject);
				})
				.attr("opacity", 0.5)
				.attr("r", 0)
				.transition()
				.ease(d3.easeLinear)
				.duration(500)
				.attr("r", function (d, i) {
					return r(Math.sqrt(d.size / 3.14));
				})
				.attr("data-size", function (d, i) {
					return d.size;
				});

			let incipit = article_circles
				.append("circle")
				.transition()
				.duration(500)
				.delay(function (d, i) {
					return i * 2;
				})
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("fill", function (d, i) {
					return apply_color(d.subject);
				})
				.attr("opacity", 0.5)
				.attr("r", function (d, i) {
					return r(Math.sqrt(d.incipit_size / 3.14));
				})
				.attr("data-incipit", function (d, i) {
					return d.incipit_size;
				});

			let discussion = article_circles
				.append("circle")
				.transition()
				.duration(500)
				.delay(function (d, i) {
					return i * 2;
				})
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("stroke", function (d, i) {
					return apply_color(d.subject);
				})
				.attr("fill", "transparent")
				.attr("stroke-width", 0.5)
				.attr("opacity", 0.9)
				.attr("r", 0)
				.transition()
				.delay(500)
				.ease(d3.easeLinear)
				.duration(500)
				.attr("r", function (d, i) {
					return r(Math.sqrt(d.discussion_size / 3.14));
				});

			// improvements
			let improvements_box = article_circles
				.append("g")
				.attr("class", "improvements")
				.attr("data-improvements", function (d, i) {
					return d.improvements;
				});

			let improvements = improvements_box
				.append("g")
				.append("use")
				.attr("xlink:href", function (d, i) {
					if (d.improvements == 1) {
						return "#improv_one";
					} else if (d.improvements == 2) {
						return "#improv_two";
					} else if (d.improvements == 3) {
						return "#improv_three";
					}
				})
				.attr("transform", function (d, i) {
					return "translate(-5,-" + r(Math.sqrt(d.size / 3.14)) + ")";
				})
				.attr("stroke", "none")
				.attr("fill", function (d, i) {
					if (d.improvements > 0) {
						return improv_col;
					} else {
						return "none";
					}
				})
				.attr("opacity", 0)
				.transition()
				.delay(improv_delay)
				.attr("opacity", 1);

			// let improvement_debug = improvements_box.append("circle")
			// 	.attr("cx",0)
			// 	.attr("cy",0)
			// 	.attr("r",30)
			//           .attr("fill", "none")
			//           .attr("stroke", function (d,i) {
			//           	if (d.improvements > 0) {
			//           		return improv_col
			//           	}
			//           	else {
			//           		return "none"
			//           	}
			//           })
		}

		function update_sort(the_subject, the_sort) {
			//load data
			total = 0;

			let subject_articles = [];
			let visit_sort;
			let filter_data;

			let subject_group = d3
				.nest()
				.key((d) => d.subject)
				.entries(data);

			for (const [d, c] of Object.entries(subject_group)) {
				if (the_subject == "all") {
					if (c.key !== "-") {
						let values = c.values;

						values.forEach(function (d, i) {
							subject_articles.push(d);
						});
					}
				} else {
					if (c.key == the_subject) {
						subject_articles = c.values;
					}
				}
			}

			visit_sort = subject_articles.sort(function (x, y) {
				return d3.descending(+x.avg_pv, +y.avg_pv);
			});

			filter_data = visit_sort.filter(function (x, y) {
				return y < filter_item;
			});

			filtered_data.forEach(function (d, i) {
				total += 1;
				d.discussion_size = +d.discussion_size;
				d.article = d.article.replace(/_/g, " ");
				d.size = +d.size;
				d.images = +d.images;
				d.issue_clarify = +d.issue_clarify;
				d.issue_sourceNeeded = +d.issue_sourceNeeded;
				d.days = +d.days;
				d.avg_pv = +d.avg_pv;
				d.avg_pv_prev = +d.avg_pv_prev;
				d.issues = +d.issues;
				d.notes = +d.notes;
				// console.log(d.article,d.issues)
			});

			let max;
			let min;
			let sort = [
				"article", // 1
				"publication", // 2
				"size", // 3
				"discussion", // 4
				"incipit", // 5
				"issue", // 6
				"images", // 7
				"references", //8
			];

			if (the_sort == 1) {
				max = total;
				min = 0;
			} else if (the_sort == 2) {
				max = d3.min(filtered_data, function (d) {
					return d.days;
				});
				min = d3.max(filtered_data, function (d) {
					return d.days;
				});
			} else if (the_sort == 3) {
				min = d3.min(filtered_data, function (d) {
					return d.size;
				});
				max = d3.max(filtered_data, function (d) {
					return d.size;
				});
			} else if (the_sort == 4) {
				min = d3.min(filtered_data, function (d) {
					return d.discussion_size;
				});
				max = d3.max(filtered_data, function (d) {
					return d.discussion_size;
				});
			} else if (the_sort == 5) {
				min = d3.min(filtered_data, function (d) {
					return d.incipit_size;
				});
				max = d3.max(filtered_data, function (d) {
					return d.incipit_size;
				});
			} else if (the_sort == 6) {
				min = 0;
				max = d3.max(filtered_data, function (d) {
					return d.issues;
				});
			} else if (the_sort == 7) {
				min = d3.min(filtered_data, function (d) {
					return d.images;
				});
				max = d3.max(filtered_data, function (d) {
					return d.images;
				});
			} else if (the_sort == 8) {
				min = d3.min(filtered_data, function (d) {
					return d.notes;
				});
				max = d3.max(filtered_data, function (d) {
					return d.notes;
				});
			}

			x = d3
				.scaleLinear()
				.domain([min, max])
				.range([0, width - 100]);
			// console.log(min,max,the_sort)

			svg.selectAll(".article").data(filtered_data).enter().append("div");

			svg.selectAll(".article")
				.transition()
				.attr("transform", function (d, i) {
					if (the_sort == 1) {
						// "article"
						return "translate(" + (x(i) + 50) + "," + 0 + ")";
					} else if (the_sort == 2) {
						// "publication"
						return "translate(" + (x(d.days) + 50) + "," + 0 + ")";
					} else if (the_sort == 3) {
						return "translate(" + (x(d.size) + 50) + "," + 0 + ")";
					} else if (the_sort == 4) {
						return (
							"translate(" +
							(x(d.discussion_size) + 50) +
							"," +
							0 +
							")"
						);
					} else if (the_sort == 5) {
						return (
							"translate(" +
							(x(d.incipit_size) + 50) +
							"," +
							0 +
							")"
						);
					} else if (the_sort == 6) {
						return (
							"translate(" + (x(d.issues) + 50) + "," + 0 + ")"
						);
					} else if (the_sort == 7) {
						return (
							"translate(" + (x(d.images) + 50) + "," + 0 + ")"
						);
					} else if (the_sort == 8) {
						return "translate(" + (x(d.notes) + 50) + "," + 0 + ")";
					}
				});
		}
	}
}

function get_year() {
	$("#year").change(function () {
		let year = parseInt(this.value);
		let subject = String($("#subjects option:selected").val());
		let sort = parseInt($("#sort option:selected").val());

		$("#d3_plot").remove();
		$("#tooltip_dv1").remove();
		$("#grid").remove();

		dv1(year, subject, sort);
	});
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function initialize_page(lang) {
	if (wikipedias_with_few_subjects.indexOf(lang) !== -1) {
		random_subject = "all"
		random_subject_index = 0
	}
	while (
		!random_subject ||
		forbidden_subjects.indexOf(random_subject) !== -1
	) {
		random_subject_index = getRandomIntInclusive(1, subjects.length - 1);
		random_subject = subjects[random_subject_index];
		console.log(random_subject);
		console.log(random_subject_index);
	}
	document.getElementById("subjects").selectedIndex = random_subject_index;

	dv1(2023, random_subject, parseInt(1));
	get_year();
}

$(document).ready(async function () {
	const country = page.getAttribute("data-country");
	const lang = page.getAttribute("data-lang");
	dataFile = `assets/data/${country.toLowerCase()}${lang}_voci_2023.tsv`;
	wiki_link = `https://${lang}.wikipedia.org/wiki/`;

	subject_file = `../data-gathering/${country.toLowerCase()}${lang}_subject_file.csv`;
	// Fetch the CSV file and initialize page
	d3.csv(subject_file).then((data) => {
		data.forEach((d) => {
			d.material = d.material.trim()
			if(!subjects.includes(d.material)){
				subjects.push(d.material)
			}
		})
		// Remove "all" from the array
		const indexAll = subjects.indexOf("all");
		if (indexAll !== -1) {
			subjects.splice(indexAll, 1);
		}

		// Sort the rest of the subjects alphabetically
		subjects.sort();

		// Add "all" back at the beginning
		subjects.unshift("all");

		console.log(subjects);
		initialize_page(lang);
	});
});

// top the top arrow 
const toTop = document.querySelector(".to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 700) {
    toTop.classList.add("active");
  } else {
    toTop.classList.remove("active");
  }
})
