var appManager = {};

// APP styles

appManager.LIST = {
	hash: 1,
	width: '100%',
	height: '35px',
	class: 'list'
};
appManager.METRO_WIDE = {
	hash: 2,
	width: '200px',
	height: '100px',
	class: 'metro_wide'
};
appManager.METRO_MEDIUM = {
	hash: 3,
	width: '100px',
	height: '100px',
	class: 'metro_medium'
};
appManager.METRO_SMALL = {
	hash: 4,
	width: '50px',
	height: '50px',
	class: 'metro_small'
};
appManager.DESKTOP = {
	hash: 5,
	width: '80px',
	height: '80px',
	class: 'desktop_icon'
};
appManager.PINNED = {
	hash: 6,
	width: '50px',
	height: '40px',
	class: 'bar_icon'
}

// APPS list

appManager.ALLAPPS = [
	{
		icon: 'assets/github.png',
		name: 'Github',
		style: appManager.LIST,
		class: "start_most_used",
		windowStyle: task.MEDIUMSIZE,
		appid: 1
	},
	{
		icon: 'assets/itchio.png',
		name: 'Itch.io',
		style: appManager.LIST,
		class: "start_most_used",
		windowStyle: task.MEDIUMSIZE,
		appid: 2
	},
	{
		icon: 'assets/linkedin.png',
		name: 'Linkedin',
		style: appManager.LIST,
		class: "start_most_used",
		windowStyle: task.MEDIUMSIZE,
		appid: 3
	},
	{
		icon: 'assets/email.png',
		name: 'Email',
		style: appManager.LIST,
		class: "start_most_used",
		windowStyle: task.MEDIUMSIZE,
		appid: 4
	}
];

function SortByName(a, b){
  var aName = a.name.toLowerCase();
  var bName = b.name.toLowerCase(); 
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

appManager.ALLAPPS.sort(SortByName);

appManager.MOSTUSEDAPPS = [
	{
		icon: 'assets/github.png',
		name: 'Github',
		style: appManager.LIST,
		class: "start_most_used",
		windowStyle: task.MEDIUMSIZE,
		task: () => window.open("https://github.com/HamzaEzzRa")
	},
	{
		icon: 'assets/itchio.png',
		name: 'Itch.io',
		style: appManager.LIST,
		class: "start_most_used",
		windowStyle: task.MEDIUMSIZE,
		task: () => window.open("https://tinysquidstudios.itch.io/")
	},
	{
		icon: 'assets/linkedin.png',
		name: 'Linkedin',
		style: appManager.LIST,
		class: "start_most_used",
		windowStyle: task.MEDIUMSIZE,
		task: () => window.open("https://www.linkedin.com/in/hamza-ezzaoui-rahali-521730190/")
	},
	{
		icon: 'assets/email.png',
		name: 'Email',
		style: appManager.LIST,
		class: "start_most_used",
		windowStyle: task.MEDIUMSIZE,
		task: () => window.location.href = "mailto:hamzaezzaouirahali@gmail.com"
	}
];

appManager.OPTIONSAPPS = [
	{
		name: "Settings",
		icon: 'assets/settings.png',
		style: appManager.LIST,
		class: 'start_option',
		windowStyle: task.MEDIUMSIZE,
		task: function() {}
	},
	{
		name: "Power",
		icon: 'assets/shutdown.svg',
		style: appManager.LIST,
		class: 'start_option',
		task: function() {}
	},
	{
		name: "All Apps",
		icon: 'assets/start.png',
		style: appManager.LIST,
		class: 'start_option',
		task: function() {}
	}
];

appManager.PINNEDAPPS = [
	{
		icon: 'assets/github.png',
		name: 'Github',
		style: appManager.PINNED,
		windowStyle: task.MEDIUMSIZE,
		appid: 1
	},
	{
		icon: 'assets/itchio.png',
		name: 'Itch.io',
		style: appManager.PINNED,
		windowStyle: task.MEDIUMSIZE,
		appid: 2
	},
	{
		icon: 'assets/linkedin.png',
		name: 'Linkedin',
		style: appManager.PINNED,
		windowStyle: task.MEDIUMSIZE,
		appid: 3
	},
	{
		icon: 'assets/email.png',
		name: 'Email',
		style: appManager.PINNED,
		windowStyle: task.MEDIUMSIZE,
		appid: 4
	}
];

appManager.DESKTOPAPPS = [
	{
		icon: 'assets/github.png',
		name: 'Github',
		style: appManager.DESKTOP,
		windowStyle: task.MEDIUMSIZE,
		appid: 1
	},
	{
		icon: 'assets/itchio.png',
		name: 'Itch.io',
		style: appManager.DESKTOP,
		windowStyle: task.MEDIUMSIZE,
		appid: 2
	},
	{
		icon: 'assets/linkedin.png',
		name: 'Linkedin',
		style: appManager.DESKTOP,
		windowStyle: task.MEDIUMSIZE,
		appid: 3
	},
	{
		icon: 'assets/email.png',
		name: 'Email',
		style: appManager.DESKTOP,
		windowStyle: task.MEDIUMSIZE,
		appid: 4
	}
];

appManager.METROAPPS = [
	[
		{
			name: "Settings",
			icon: 'assets/settings.png',
			style: appManager.METRO_SMALL,
			windowStyle: task.MEDIUMSIZE,
			class: 'start_metro'
		},
		{
			name: "Power",
			icon: 'assets/shutdown.svg',
			style: appManager.METRO_SMALL,
			windowStyle: task.MEDIUMSIZE,
			class: 'start_metro'
		},
		{
			name: "All Apps",
			icon: 'assets/start.png',
			style: appManager.METRO_SMALL,
			windowStyle: task.MEDIUMSIZE,
			class: 'start_metro'
		}
	], 
	[
		{
			name: "Settings",
			icon: 'assets/settings.png',
			style: appManager.METRO_MEDIUM,
			windowStyle: task.MEDIUMSIZE,
			class: 'start_metro'
		},
		{
			name: "Power",
			icon: 'assets/shutdown.svg',
			style: appManager.METRO_MEDIUM,
			windowStyle: task.MEDIUMSIZE,
			class: 'start_metro'
		},
		{
			name: "All Apps",
			icon: 'assets/start.png',
			style: appManager.METRO_WIDE,
			windowStyle: task.MEDIUMSIZE,
			class: 'start_metro'
		}
	]
];

appManager.SIDEBARAPPS = [
	{
		icon: 'assets/battery.png',
		name: 'Battery',
		task: function() {
			
		}
	},
	{
		icon: 'assets/wifi.ico',
		name: 'Wifi',
		task: function() {
			
		}
	},
	{
		icon: 'assets/volume.png',
		name: 'Sound',
		task: function() {
			
		}
	},
	{
		icon: 'assets/notification.png',
		name: 'Notification',
		task: function() {
			
		}
	}
];

appManager.ADDITIONS = {
	BACK: {
		name: "Back",
		icon: 'assets/start.png',
		style: appManager.LIST,
		class: 'start_back',
		task: function() {
			start.toggleApps();
		}
	}
};

// APP methods

appManager.init = function(obj) {
	return appManager.draw(obj);
}

appManager.getStyle = function(obj) {
	return obj.style.class;
}

appManager.find = function(name) {
	if (name != '') {
		name = name.toUpperCase();
		result = [];
		for(i = 0 ; i < appManager.ALLAPPS.length; i++) {
			if(appManager.ALLAPPS[i].name.toUpperCase().indexOf(name) >= 0) {
				result.push(appManager.ALLAPPS[i]);
			}
		}
		return result;
	}
	else
		return false;
}

appManager.draw = function(obj) {
	var holder = $("<div />", {
		class: 'app ' + appManager.getStyle(obj) + ' ' + obj.class,
		width: obj.style.width,
		height: obj.style.height
	});

	var span = $("<span />", {
		class: 'app_img_holder'
	});

	var img = $("<img />", {
		src: obj.icon
	}).appendTo(span);

	span.appendTo(holder);

	var name_holder = $("<span />", {
		class: 'app_name'		
	});

	var name = $("<span />", {
		text: obj.name
	}).appendTo(name_holder);

	holder.append(name_holder);

	holder.click(function() {
		obj.task();
	});

	return holder;
}
