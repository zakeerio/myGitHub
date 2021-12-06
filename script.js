$(document).ready(function () {

			var usertoken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFiY0BnbWFpbC5jb20ifQ.aDDB9nBoq5ZftWJIZSLXh8I-O1NsLFtYqk5sraDsNCk';

			// var header = { 'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFiY0BnbWFpbC5jb20ifQ.aDDB9nBoq5ZftWJIZSLXh8I-O1NsLFtYqk5sraDsNCk' };
			var header = { 'Authorization': usertoken };
			// console.log(header);
			var api_url = 'https://api.15rock.com';

			var companies_settings = {
				'url': api_url + '/netzero/transition/companies_list',
				'type': 'GET',
				'processData': false,
				'contentType': 'application/json',
				'dataType': 'json',
				'headers': header,
			};

			// console.log(companies_settings);

			$.ajax(companies_settings).done(function (response) {
				// console.log(response);
				var companies_list = "";

				companies = response;

                if (companies.length > 0) {

					companies_list += "<option value=''>- Select Company -</option>";
                    for (const company of companies) {
						var companyname = company.company_name;
						companies_list += "<option value='"+companyname+"'>"+ companyname + "</option>";
                    }

                }
				setTimeout(function(){
					console.log(companies_list);
					$("#companies_list").html(companies_list);
				},100)

			}).fail(function (error) {
				console.log(error.message + " Status " + error.status);
			});


			$(document).on('change', "#companies_list", function(){
				var companyname = $(this).val();
				// var projectsdiv = $(this).find('.company_name').data('projectsdiv');
				
				var company_data =  { 'company': companyname };
				// if($("#projects_list"+projectsdiv).html() != ""){
				// 	return false;
				// }

                
                
                
				var project_settings  = {
                    'url': api_url + '/netzero/transition/dashboard_company_project',
					'type': 'POST',
					'processData': false,
					'contentType': 'application/json',
					'dataType': 'json',
					'headers': header,
					'data': JSON.stringify(company_data),
				};
				$.ajax(project_settings).done(function (response) {
                    console.log(response);
					company_desc = response.company_netzero_description;
					projects = response.project_info;
					var company_info = response.company_level;
					
					var projects_list = '';
                    
                        $("#compoany_projects, #company_project_count").html(company_info.num_of_projects+" projects");
                        var total_funding = (company_info.total_funding_level !="") ? numberWithCommas(company_info.total_funding_level) : '0'; ;
                        $("#company_inveset_amount").html("$ "+total_funding);
                        $("#company_invested").html("$ "+total_funding+" Invested");
                        
                        $("#company_image").attr('src',"https://eodhistoricaldata.com"+company_info.logo_url);
                        $("#company_name").html(companyname);
                        $("#company_description").html(company_info.company_netzero_description);

                        var occupied_cur = (company_info.total_carbon_current_impact_of_goals_abs).toFixed(2);

                        $("#overall_progress").html(occupied_cur+" out of "+company_info.total_carbon_impact_abs);
                        var progress_bar_percent = ((occupied_cur * 100) / company_info.total_carbon_impact_abs).toFixed(2);
                        $("#progress-bar-value").css('width',progress_bar_percent+"%");
                        $("#company_overall_progressbar").html(progress_bar_percent+"%");
                        
                        $("#company_target_date").html(company_info.company_netzero_target_date);
                        $(".companies,.project-numbers").removeClass("d-none");
                    piechartper = (company_info.company_carbon_progress_pct *100 );
                    
                    var doughnutData = [
                        {
                            borderColor: ["#567C6C","#F0E1CB"],
                            backgroundColor: ["#567C6C","#F0E1CB"],
                            data: [(piechartper).toFixed(2), (100 - piechartper).toFixed(2)],
                        }
                    ];

                    var doughnutOptions = {
                        labels: ["Current Carbon: ","Target Carbon: "], 
                        datasets: doughnutData,
                    }
                    
                    var ctxData = document.getElementById('myDoughnutGraph').getContext('2d');
                    new Chart(ctxData, {
                        // type: 'doughnut',
                        type: 'pie',
                        data: doughnutOptions,
                        options: {
                            title: {
                                display: true,
                                text: ["Current: "+(company_info.current_carbon), "Target: "+ (company_info.company_overall_target) ],
                                font : { weight: 'bold'},
                                position: "bottom",
                                fullWidth: true,
                                padding: 0,
                                
                            },
                            legend: {
                                display: false
                            },
                            
                        },
                    });
					
					if(projects.length > 0) {
						
                        var labelsdata = [];
						var chatdata = [];
						var lineGraphData = [];
                        
						for (const project of projects) {
							// console.log(project.project_name);

							// loadInvestments(companyname,project);
                            loadChartData(companyname, project.project_id);
                            
							var projectName = project.project_name;
                            
                            projects_list += '<div class="single-project">';
                                projects_list += '<div class="grid-col-2">';
                                    projects_list += '<div>';
                                        projects_list += '<div class="mb-10">';
                                            projects_list += '<div class="bold">Project name:</div><div>'+projectName+'</div>';
                                        projects_list += '</div>';
                                        projects_list += '<div class="mb-10">';
                                            projects_list += '<div class="bold">Project Description:</div><div>'+project.project_description+'</div>';
                                        projects_list += '</div>';
                                        projects_list += '<div class="d-flex-3 jc-sb">';
                                            projects_list += '<div class="bold">Carbon Impact:</div><a href="#" class="link w-inline-block" id="view_graph"><div class="bold">View graph</div></a>';
                                        projects_list += '</div>';

                                        contribution_per = ((project.project_target_contribution_overall_carbon * 100) /project.project_carbon_impact).toFixed(2);
                                        projects_list += '<div>'+project.project_carbon_impact+' ('+contribution_per+'% contribution overall carbon)</div>';
                                    projects_list += '</div>';
                                    projects_list += '<div class="div-block-16">';
                                        var investment_amt = (project.investment_amount !="") ? "$"+project.investment_amount+" Invested" : "Not Funded";
                                        projects_list += '<div class="bold mb-10">'+investment_amt+'</div><div class="clr-org">Last update:</div><div class="clr-org">'+project.project_last_update+'</div>';
                                    projects_list += '</div>';
                                projects_list += '</div>';
                                projects_list += '<div>';
                                    projects_list += '<div class="align-right bold">By: '+project.company_netzero_target_date+'</div>';
                                    projects_list += '<div class="row-col-2">';
                                        projects_list += '<div class="bold">Project progress ratio:</div>';
                                        var occupied = (project.current_project_progress_pct.toFixed(2) * 100);

                                        projects_list += '<div class="progress-bar h-20"><div class="progress-bar-value light" style="width: '+occupied+'%" ><div>'+occupied+'%</div></div></div>';
                                    projects_list += '</div>';
                                    projects_list += '<div class="row-col-2">';
                                        projects_list += '<div class="bold">Contribution progress ratio:</div>';
                                        
										var occupied_con = (((project.project_target_contribution_overall_carbon*100) * 100) / project.project_current_contribution_overall_carbon ).toFixed(2);

                                        projects_list += '<div class="progress-bar h-20"><div class="progress-bar-value" style="width: '+occupied_con+'%"><div>'+occupied_con+'%</div></div></div>';
                                    projects_list += '</div>';
                                projects_list += '</div>';
                            projects_list += '</div>';

                            labelsdata.push(project.project_current_contribution_overall_carbon);
							chatdata.push(project.project_target_contribution_overall_carbon * 100);


                            // https://api.15rock.com/netzero/transition/project_updates
                            // {
                            //     "company" : "TEST1", "project_id":1
                            // }



						}
						// projects_list += "</div>";
						$("#companies_list_items").html(projects_list);






						// var lineGraphDataValues = [
						// 	{
						// 		label: companyname,
						// 		backgroundColor: "rgb(54, 162, 235, 0.6)",
						// 		fillColor: "rgba(220,220,220,0.2)",
						// 		strokeColor: "rgba(220,220,220,1)",
						// 		pointColor: "rgba(220,220,220,1)",
						// 		pointStrokeColor: "#fff",
						// 		pointHighlightFill: "#fff",
						// 		pointHighlightStroke: "rgba(220,220,220,1)",
						// 		data: chatdata
						// 	}
						// ];


						// console.log(lineGraphDataValues);

						// var lineGraphData = {
						// 	labels: labelsdata, // ["08-MAY-20", "20-MAY-20", "30-MAY-20", "08-JUN-20", "20-JUN-20", "30-JUN-20", "08-JUL-20"],
						// 	datasets: lineGraphDataValues,
						// };

						// var ctx = document.getElementById('keyStatsProjects').getContext('2d');
						// var myChart = new Chart(ctx, {
						// 	type: 'line',
						// 	data: lineGraphData,
						// });



					}

				}).fail(function (error){
					console.log(error.message + " Status " + error.status);
				})
			})

			function loadInvestments(companyname,project){

				var company_data =  { 'company': companyname };
				var project_id = project.project_id;
				var project_name = project.project_name;
				
				var investment_settings  = {
					'url': api_url + '/netzero/transition/project_to_investments',
					'type': 'POST',
					'processData': false,
					'contentType': 'application/json',
					'dataType': 'json',
					'headers': header,
					'data': JSON.stringify(company_data),
				};
				$.ajax(investment_settings).done(function (response) {
					// console.log(response);
					investments = response;
					if(investments.length > 0) {
						var investments_list = '';
						investments_list += "<div class='investment_heading_list'><span>"+project_name+"</span> Investments List</div>";

						investments_list += "<div class='investments_list' style='color: green;'>";

						for (const investment of investments) {
							if(project_id == investment.project_id ){
								console.log(investment.investment_name);
								// var investmentName = investment.investment_name;
								investments_list += "<div class='investment_item'>";
									investments_list += "<h6>Investment Description: "+ investment.investment_description + " <br> Invetment Amount: "+ investment.investment_amount + "</h6>";
									// investments_list += "<div id='investments_list"+investment.investment_id+"'></div>";							
								investments_list += "</div>";
							}
						}
						investments_list += "</div>";
						$("#investments_list"+project_id).html(investments_list);

						// console.log(investments_list);
					}

				}).fail(function (error){
					console.log(error.message + " Status " + error.status);
				})
			}


            function numberWithCommas(x) {
                if(Number.isInteger(x) == false){
                x = Number(x).toFixed(2) // "0.00"
                }
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            $("#show_projects").on("click", function(){
                if($("#companies_list_items").hasClass("d-none")) {
                    $("#companies_list_items").removeClass("d-none");
                } else {
                    $("#companies_list_items").addClass("d-none");
                }
            })

		})

        
        
        $(docyment).ready(function() {
            var usertoken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFiY0BnbWFpbC5jb20ifQ.aDDB9nBoq5ZftWJIZSLXh8I-O1NsLFtYqk5sraDsNCk';

			// var header = { 'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFiY0BnbWFpbC5jb20ifQ.aDDB9nBoq5ZftWJIZSLXh8I-O1NsLFtYqk5sraDsNCk' };
			var header = { 'Authorization': usertoken };
			// console.log(header);
			var api_url = 'https://api.15rock.com';

        
			function loadChartData(companyname){
			
                var company_data = { 'company': companyname };
                // var company_data = companydata
                
                var investment_settings  = {
                    'url': api_url + '/netzero/transition/project_updates',
                    'type': 'POST',
                    'processData': false,
                    'contentType': 'application/json',
                    'dataType': 'json',
                    'headers': header,
                    'data': JSON.stringify(company_data),
                };
                $.ajax(investment_settings).done(function (response) {
                    // console.log(response);
                    investments = response;
                    if(investments.length > 0) {
                        
                        var chartList = response;
                        var counter = 1;

                        if (chartList != "" && chartList != null) {
                            var labelsdata = [];
                            var chatdata = [];
                            var lineGraphData = [];

                            for (const investment of investments) {
                                console.log(investment.investment_name);
                                // var investmentName = investment.investment_name;
                                labelsdata.push(investment.investment_amount);
                                chatdata.push(investment.investment_amount);
                            }

                            var lineGraphDataValues = [
                                {
                                    label: companyname,
                                    backgroundColor: "rgb(54, 162, 235, 0.6)",
                                    fillColor: "rgba(220,220,220,0.2)",
                                    strokeColor: "rgba(220,220,220,1)",
                                    pointColor: "rgba(220,220,220,1)",
                                    pointStrokeColor: "#fff",
                                    pointHighlightFill: "#fff",
                                    pointHighlightStroke: "rgba(220,220,220,1)",
                                    data: chatdata
                                }
                            ];

                            var lineGraphData = {
                                labels: labelsdata, // ["08-MAY-20", "20-MAY-20", "30-MAY-20", "08-JUN-20", "20-JUN-20", "30-JUN-20", "08-JUL-20"],
                                datasets: lineGraphDataValues,
                            };

                            var ctx = document.getElementById('keyStats').getContext('2d');
                            var myChart = new Chart(ctx, {
                                type: 'line',
                                data: lineGraphData,
                            });
                        }
                    }

                }).fail(function (error){
                    console.log(error.message + " Status " + error.status);
                })

            }
        });
