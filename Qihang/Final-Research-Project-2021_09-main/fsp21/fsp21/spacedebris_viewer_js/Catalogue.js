// author: Zhen Li
// email: hpulizhen@163.com
// enhanced author: Luyang Han
// email: hanluhou98@gmail.com
// Further enhanced auther: Qihang Chen
// email: 1806495393@qq.com

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
	getDebriOperation_status(choice, data){
		if (choice == "isat"){
			var s = "Non-operational";
			if(data < this.debris_kep.length){
				var aa = this.debris_kep[data]["payload_operational_status"];
			
				if(aa == '+    ') {s = "Operational";} /// operational 
				else if(aa == '-    ') 	{s = "Non-operational";} /// non-operational
				else if(aa == 'P    ') 	{s = "Partially operational";} /// partially operational 
				else if(aa == 'B    ') 	{s = "Backup/Standby";} /// backup/standby
				else if(aa == 'S    ') 	{s = "Spare";} /// spare
				else if(aa == 'X    ') 	{s = "Extened mission";} /// extended mission
				else if(aa == 'D    ') 	{s = "Decayed";} /// Decayed
				else if(aa == '?    ')  {s = "Unknown";} /// unknown	
				else  /// not set
				{
					s = "Non-operational";
				}
			}else if(data >= this.debris_kep.length 
				&& data < this.getNumberTotal() ){
				s = "Unknown";
				// return this.debris_tle[isat-this.debris_kep.length]["name"];
				// tle  does not include operational status
			}	

			return s;
		}
		else if (choice == "cosparID"){
			for (let i = 0; i < this.debris_kep.length; i++) {
				if (this.debris_kep[i]["COSPAR_ID"].trim() == data.trim()) {
				  return this.debris_kep[i].payload_operational_status.trim();
			  	}
			  }
			
		}
		

	}

	getDebriCategory(isat)
	{
		var cat = "Unknown";
		if (isat < this.debris_kep.length)
		{
			var cat_00 = this.debris_kep[isat]["apogee_hgt"].trim()
			var cat_11 = this.debris_kep[isat]["perigee_hgt"].trim()
			let cat_22 = this.debris_kep[isat]["eccentricity"]
			var inclinationDegree = Number(this.debris_kep[isat]["inclination_deg"].trim())
			var cat_0 = Number(cat_00)
			var cat_1 = Number(cat_11)
			let cat_2 = Number(cat_22)
			// else if ( cat_0 == 35786 || cat_1 == 35786 ) { cat = "Geosynchronous Equatorial Orbit" } //GEO
			if ( cat_0 <= 2000 && cat_1 <= 2000 && cat_2 < 0.1 ) { cat = "Low Earth Orbit"} //LEO
			else if ( (cat_0 > 2000 && cat_0 < 35586) && (cat_1 > 2000 && cat_1 < 35586)&& cat_2 < 0.05){
				cat = "Middle Earth Orbit"} //MEO
			else if ((cat_0 > 35586 && cat_0 < 36286) && (cat_1 > 35586 && cat_1< 336286 ) && cat_2 < 0.05){
				cat = "Geosynchronous Equatorial Orbit"; 
				//GEO (HEIGHT REFERENCE FROM https://earthobservatory.nasa.gov/features/OrbitsCatalog) 36000km
				//https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits#GEO  35786km
				//Current: https://orbitaldebris.jsc.nasa.gov/library/usg_orbital_debris_mitigation_standard_practices_november_2019.pdf 35586-35986(+300)

			}else if ((cat_2 > 0.05 && inclinationDegree >=25 && inclinationDegree <= 155) || cat_2 > 0.05 ){ 
				cat = "Highly Elliptical Orbit"} //HEO	REFERENCE FROM https://www.itu.int/itunews/manager/display.asp?lang=en&year=2003&issue=05&ipage=heo&ext=html		
			else{
				cat = "Unknown" 
			} 

		}

		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			cat = "Unknown";
			// return this.debris_tle[isat-this.debris_kep.length]["name"];
			// tle  does not include LEO MEO GEO Information
		} // Seems not important

		return cat;
	}

	getDebriCountry(isat)
	{
		var c = "Unknown";
		let deriOwnership ={
			AB:	 	"Arab Satellite Communications Organization",
			ABS: 	"Asia Broadcast Satellite",
			AC:		"Asia Satellite Telecommunications Company (ASIASAT)",
			ALG:	"Algeria",
			ANG:	"Angola",
			ARGN:	"Argentina",
			ASRA:	"Austria",
			AUS:	"Australia",
			AZER:	"Azerbaijan",
			BEL:	"Belgium",
			BELA:	"Belarus",
			BERM:	"Bermuda",
			BGD:	"Peoples Republic of Bangladesh",
			BHUT:	"Kingdom of Bhutan",
			BOL:	"Bolivia",
			BRAZ:	"Brazil",
			BUL:	"Bulgaria",
			CHN:    "People's Republic of China",
			CA:		"Canada",
			CHBZ:	"China/Brazil",
			CHTU:	"China/Turkey",
			CHLE:	"Chile",
			CIS:	"Commonwealth of Independent States (former USSR)",
			COL:	"Colombia",
			CRI:	"Republic of Costa Rica",
			CZCH:	"Czech Republic (former Czechoslovakia)",
			DEN:	"Denmark",
			ECU:	"Ecuador",
			EGYP:	"Egypt",
			EU:     "European Union",
			ESA:	"European Space Agency",
			ESRO:	"European Space Research Organization",
			EST:	"Estonia",
			EUME:	"European Organization for the Exploitation of Meteorological Satellites (EUMETSAT)",
			EUTE:	"European Telecommunications Satellite Organization (EUTELSAT)",
			FGER:	"France/Germany",
			FIN:	"Finland",
			FR:		"France",
			FRIT:	"France/Italy",
			GER:	"Germany",
			GHA:	"Republic of Ghana",
			GLOB:	"Globalstar",
			GREC:	"Greece",
			GRSA:	"Greece/Saudi Arabia",
			GUAT:	"Guatemala",
			HUN:	"Hungary",
			IM:		"International Mobile Satellite Organization (INMARSAT)",
			IND:	"India",
			INDO:	"Indonesia",
			IRAN:	"Iran",
			IRAQ:	"Iraq",
			IRID:	"Iridium",
			ISRA:	"Israel",
			ISRO:	"Indian Space Research Organisation",
			ISS:	"International Space Station",
			IT:		"Italy",
			ITSO:	"International Telecommunications Satellite Organization (INTELSAT)",
			JPN:	"Japan",
			Japan:  "Japan",
			KAZ:	"Kazakhstan",
			KEN:	"Republic of Kenya",
			LAOS:	"Laos",
			LKA:	"Democratic Socialist Republic of Sri Lanka",
			LTU:	"Lithuania",
			LUXE:	"Luxembourg",
			MA:		"Morroco",
			MALA:	"Malaysia",
			MCO:	"Principality of Monaco",
			MDA:	"Republic of Moldova",
			MEX:	"Mexico",
			MMR:	"Republic of the Union of Myanmar",
			MNG:	"Mongolia",
			MUS:	"Mauritius",
			NATO:	"North Atlantic Treaty Organization",
			NETH:	"Netherlands",
			NICO:	"New ICO",
			NIG:	"Nigeria",
			NKOR:	"Democratic People's Republic of Korea",
			NOR:	"Norway",
			NPL:	"Federal Democratic Republic of Nepal",
			NZ:		"New Zealand",
			Other:  "Other countries",
			O3B:	"O3b Networks",
			ORB:	"ORBCOMM",
			PAKI:	"Pakistan",
			PERU:	"Peru",
			POL:	"Poland",
			POR:	"Portugal",
			PRC:	"People's Republic of China",
			PRY:	"Republic of Paraguay",
			PRES:	"People's Republic of China/European Space Agency",
			QAT:	"State of Qatar",
			RASC:	"RascomStar-QAF",
			ROC:	"Taiwan (Republic of China)",
			ROM:	"Romania",
			RP:		"Philippines (Republic of the Philippines)",
			RWA:	"Republic of Rwanda",
			RUS:    "Russia",
			SAFR:	"South Africa",
			SAUD:	"Saudi Arabia",
			SDN:	"Republic of Sudan",
			SEAL:	"Sea Launch",
			SES:	"SES",
			SGJP:	"Singapore/Japan",
			SING:	"Singapore",
			SKOR:	"Republic of Korea",
			SK:     "Republic of Korea",
			SPN:	"Spain",
			STCT:	"Singapore/Taiwan",
			SVN:	"Slovenia",
			SWED:	"Sweden",
			SWTZ:	"Switzerland",
			TBD:	"To Be Determined",
			THAI:	"Thailand",
			TMMC:	"Turkmenistan/Monaco",
			TUN:	"Republic of Tunisia",
			TURK:	"Turkey",
			UAE:	"United Arab Emirates",
			UK:		"United Kingdom",
			UKR:	"Ukraine",
			UNK:	"Unknown",
			URY:	"Uruguay",
			US:		"United States",
			USA:    "United States",
			USBZ:	"United States/Brazil",
			VENZ:	"Venezuela",
			VTNM:	"Vietnam"
		}
		if (isat < this.debris_kep.length)
		{
			var bb = this.debris_kep[isat]["owner"].trim();
			// if (bb == 'US') {c = "The United states"} //The United states
			// else if (bb == 'PRC') {c = "China"} //China
			// else if (bb == 'CIS') {c = "Russia" } //Russia
			// else if (bb == 'UK') {c = "United Kindom"} //UK
			// else if (bb == 'ESA') {c = "European Union"} //European Union
			// else {c = "Other countries"} //other countris
			// 检查bb是否在deriOwnership的键中
			if (deriOwnership.hasOwnProperty(bb)) {
				// 如果存在，将c设置为对应的值（所有者全名）
				c = deriOwnership[bb];
			} else {
				c = "Unknown"; // 其他国家
			}
		}
		else if(isat >= this.debris_kep.length && isat < this.getNumberTotal() ){
			c = "Unknown";
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
			if (cross_section <= 1) {m = "RCS ≤ 1"}
			else if (cross_section <= 10 && cross_section > 1) {m = "1 < RCS ≤ 10"}
			else if (cross_section > 10) {m = "RCS > 10"}

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

	getDebriID(isat){
		let id = "unknown";
		if(isat < this.debris_kep.length)
		{
			id =  this.debris_kep[isat]["COSPAR_ID"];
		}
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			id =  "Unknown";
			// return this.debris_tle[isat-this.debris_kep.length]["name"];
			// tle  does not include operational status
		}

		return id;

	}

	getDebriType(isat){
		let type = "unknown";
		if(isat < this.debris_kep.length)
		{
			let typeOrign =  this.debris_kep[isat]["RSO_type"].trim();
			if (typeOrign == "rb"){type = "Rocket Body"}
			else if (typeOrign == "plat"){type = "Platform"}
			else if (typeOrign == "deb"){type = "Debris"}
			else if (typeOrign == "u"){type = "Unknown"}
		}
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			type =  "Unknown";
			// return this.debris_tle[isat-this.debris_kep.length]["name"];
			// tle  does not include operational status
		}

		return type;

	}

	getDebriOrbitPeriod(cosparID) {
		console.log(cosparID)
		for (let i = 0; i < this.debris_kep.length; i++) {
		  if (this.debris_kep[i]["COSPAR_ID"].trim() == cosparID.trim()) {
			return this.debris_kep[i].orbital_period.trim(); // in seconds
		}
		}
		
	  }
	
	getSemiMajorAxis(isat){
		let sma =  this.debris_kep[isat]["semi_major_axis"];
		return sma;
	}

	getApogee(isat){
		let apogee =  this.debris_kep[isat]["apogee_hgt"];
		return apogee;
	}

	getPerigee(isat){
		let perigee =  this.debris_kep[isat]["perigee_hgt"];
		return perigee;
	}

	getInclinationAng(isat){
		let inclinationAng =  this.debris_kep[isat]["inclination_deg"];
		return inclinationAng;
	}

	getEccentricity(isat){
		let eccentricity=  this.debris_kep[isat]["eccentricity"];
		return eccentricity;
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
					that.debris_kep[isat]["apogee"] = parseFloat(idebri["apogee_hgt"]);
					that.debris_kep[isat]["perigee"] = parseFloat(idebri["perigee_hgt"]);
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
	compute_debri_position_eci(isat, time){
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
	kep2tle(kep){}


}
