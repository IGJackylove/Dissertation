// author: Zhen Li
// email: hpulizhen@163.com
// enhanced author: Luyang Han
// email: hanluhou98@gmail.com

//the class to manage the Catalogue data

class Catalogue
{
	constructor(){
		/// nothing
		this.debris_kep=[]; /// debris described in keplerian elements
		this.debris_tle=[]; /// debris described in two line elements
		this.data_load_complete=false;
		
	}

	clear_catalog(type)
	{
		if(type=="kpe")
		{
			this.debris_kep=[];
		}
		else if(type=="tle")
		{
			this.debris_tle=[];
		}
		else
		{
			this.debris_kep=[];
			this.debris_tle=[];
		}

		this.data_load_complete=false;
	}

	stringToDate(_date_str,_format,_delimiter)
	{

		var time = _date_str.split(_delimiter);
		var formatedDate = new Date(time[0],(time[0]-1),time[2]);
		return formatedDate;

        // var formatLowerCase=_format.toLowerCase();
        // var formatItems=formatLowerCase.split(_delimiter);
        // var dateItems=_date_str.split(_delimiter);
        // var monthIndex=formatItems.indexOf("mm");
        // var dayIndex=formatItems.indexOf("dd");
        // var yearIndex=formatItems.indexOf("yyyy");
        // var month=parseInt(dateItems[monthIndex]);
        // month-=1;
        // var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
        // return formatedDate;
	}

	getNumberTotal()
	{
		return this.debris_kep.length + this.debris_tle.length;
	}

	getDebriInfo(isat)
	{
		if(isat < this.debris_kep.length)
		{
			return this.debris_kep[isat];
		}
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			return this.debris_tle[isat-this.debris_kep.length]
		}
	}

	getDebriName(isat)
	{
		if(isat < this.debris_kep.length)
		{
			return this.debris_kep[isat]["RSO_name"];
		}
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			return this.debris_tle[isat-this.debris_kep.length]["name"];
		}
	}
	
	//ref: http://www.celestrak.com/satcat/status.php
	getDebriOperation_status(isat)
	{
		var s = -1;
		if(isat < this.debris_kep.length)
		{
			var aa = this.debris_kep[isat]["payload_operational_status"];
			
			if(aa == '+    ') {s = 1;} /// operational 
			else if(aa == '-    ') 	{s = -1;} /// non-operational
			else if(aa == 'P    ') 	{s = 0.5;} /// partially operational 
			else if(aa == 'B    ') 	{s = 0.2;} /// backup/standby
			else if(aa == 'S    ') 	{s = 0.8;} /// spare
			else if(aa == 'X    ') 	{s = 0.3;} /// extended mission
			else if(aa == 'D    ') 	{s = -0.2;} /// Decayed
			else if(aa == '?    ')  {s = 0;} /// unknown	
			else  /// not set
			{
				s = -1;
			}
		}
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			s = 0;
			// return this.debris_tle[isat-this.debris_kep.length]["name"];
			// tle  does not include operational status
		}

		return s;

	}

	getDebriCategory(isat)
	{
		var cat_num = -1;
		if (isat < this.debris_kep.length)
		{
			var cat_00 = this.debris_kep[isat]["apogee_hgt"].trim()
			var cat_11 = this.debris_kep[isat]["perigee_hgt"].trim()
			var cat_0 = Number(cat_00)
			var cat_1 = Number(cat_11)

			if ( cat_0 <= 2000 && cat_1 <= 2000 ) { cat_num = 1} //LEO
			else if ( (cat_0 > 2000 && cat_0 < 35786) && (cat_1 > 2000 && cat_1 < 35786) ) {cat_num = 2} //MEO
			else if ( cat_0 == 35786 || cat_1 == 35786 ) { cat_num = 3 } //GEO
			else { cat_num = -1 }

		}

		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			cat_num = -1;
			// return this.debris_tle[isat-this.debris_kep.length]["name"];
			// tle  does not include LEO MEO GEO Information
		}

		return cat_num;
	}

	getDebriCountry(isat)
	{
		var c = -1;
		if (isat < this.debris_kep.length)
		{
			var bb = this.debris_kep[isat]["owner"];
			if (bb == 'US   ') {c = 1} //The United states
			else if (bb == 'PRC  ') {c = 2} //China
			else if (bb == 'CIS  ') {c = 3 } //Russia
			else if (bb == 'UK   ') {c = 4} //UK
			else if (bb == 'ESA  ') {c = 5} //European Union
			else {c = 6} //other countris
		}

		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			c = -1;
			// return this.debris_tle[isat-this.debris_kep.length]["name"];
			// tle  does not include LEO MEO GEO Information
		}

		return c;
	}

	getDebriCross_Section(isat)
	{
		var m = -1;
		if (isat < this.debris_kep.length)
		{
			var cross_section_0 = this.debris_kep[isat]["radar_cross_section"].trim()
			var cross_section = Number(cross_section_0);
			if (cross_section <= 1) {m = 1}
			else if (cross_section <= 10 && cross_section > 1) {m = 2}
			else if (cross_section > 10) {m = 3}

		}
		
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			m = -1;
			// return this.debris_tle[isat-this.debris_kep.length]["name"];
			// tle  does not include LEO MEO GEO Information
		}

		return m;
	}


	/// read in the debris data in the format of JSON 读取json文件
	loadcatlog(orbit_type,jsonFile)
	{
		console.log("reading JSON")
		var that = this;
		/// Here we used sync mode which will cause Cesium an issue in the loading of Earth
		/// possible solution is to integrate Cesium viewer in the Catalogue class 
		$.ajax({
			url: jsonFile,
			type: "GET",
			dataType: "json",
			async: true,
			success: function(data) { /// a callback function to parse the data into the class object
				if(orbit_type == "tle")
				{
				that.debris_tle = data.debris;//the field "debris" in the json file
				console.log("I am loading tle data tle using ajax");
				console.log(that.debris_tle.length);
				that.data_load_complete = true;
				}
				else if(orbit_type == "kep")
				{
				that.debris_kep = data.debris;
				var isat=-1;
				for(isat = 0;isat < that.debris_kep.length; isat++)
				{
					var idebri = that.debris_kep[isat];
					
					var epoch_of_orbit_str = idebri["epoch_of_orbit"];
					
					var t0_str = epoch_of_orbit_str.split("-");
					var month = parseInt(t0_str[1])-1;
					that.debris_kep[isat]["epoch_of_orbit"] = new Date(t0_str[0],month,t0_str[2]);
					
					that.debris_kep[isat]['semi_major_axis'] = parseFloat(idebri['semi_major_axis']);
					that.debris_kep[isat]["eccentricity"] = parseFloat(idebri["eccentricity"]);
					that.debris_kep[isat]["inclination"] = parseFloat(idebri["inclination"]);
					that.debris_kep[isat]["RAAN"] = parseFloat(idebri["RAAN"]);
					that.debris_kep[isat]["argument_of_perigee"] = parseFloat(idebri["argument_of_perigee"]);
					that.debris_kep[isat]["true_anomaly"] = parseFloat(idebri["true_anomaly"]);
				}
				console.log("I am loading kep data using ajax");
				console.log(that.debris_kep.length);
				that.data_load_complete = true;
				}
			}

		})



	}
	
	/// compute the positon of debris in eci
	/// time is in  JavaScript Date in UTC
	compute_debri_position_eci(isat, time)
	{
		if(isat < this.debris_kep.length) /// using keplerian propagation
		{
			var idebri = this.debris_kep[isat];
			var positionAndVelocity={position:{x:0,y:0,z:0},velocity:{x:0,y:0,z:0}};
			//return this.debris_kep[isat];
			var kep = new KeplerianElement();
			kep.setElements(idebri['semi_major_axis'],idebri["eccentricity"],
							idebri["inclination"],idebri["RAAN"],
							idebri["argument_of_perigee"],idebri["true_anomaly"]
							);
			
			var tt0 = idebri["epoch_of_orbit"];
			
			var time_diff = (time - tt0)/1000.0; /// in sec
			
			kep.updateElements(time_diff);
			var pv = kep.getStateVector();
			positionAndVelocity.position.x = pv[0];//cartesian X
			positionAndVelocity.position.y = pv[1];//cartesian Y
			positionAndVelocity.position.z = pv[2];//Cartesian Z

			positionAndVelocity.velocity.x = pv[3];
			positionAndVelocity.velocity.y = pv[4];
			positionAndVelocity.velocity.z = pv[5];
			
			return positionAndVelocity;
		}
		else if(isat >= this.debris_kep.length /// using SGP4 propagation
			&& isat < this.getNumberTotal() )
		{
			var idebri = this.debris_tle[isat-this.debris_kep.length];
			var line1,line2;
			line1 = idebri["line1"];
			line2 = idebri["line2"];
			
			var satrec = satellite.twoline2satrec(line1, line2);
			var positionAndVelocity = satellite.propagate(satrec,time); /// in km
			return positionAndVelocity;
			//return this.debris_tle[isat-this.debris_kep.length]
		}
		else
		{
			alert("unknown debri index!!!");
		}

	}
	/*convert from keplerian elements to twoline elements */
	kep2tle(kep)
	{

	}


}
