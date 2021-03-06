var search = {};

search.apps = [
	{
		name: 'Search',
		icon: 'assets/menu.png',
		class: 'search_menu'
	},
	{
		name: 'Home',
		icon: 'assets/home.png',
		class: 'top'
	},
	{
		name: 'Settings',
		icon: 'assets/settings_logo.png',
		class: 'top'
	},
	{
		name: 'Cortana',
		icon: 'assets/cortana.png',
		class: 'bottom'
	}
];

search.holder;
search.container = "#window";
search.results_holder, search.input;

search.selected;


search.drawHolder = function() {
	search.holder = $("<div />", {
		class: 'search_holder'
	});

	var bg = $("<div />", {
		class: 'search_holder_background'
	});

	var holder = $("<div />", {
		id: 'search_holder'
	});

	holder.append(bg);
	holder.append(search.holder);

	$(search.container).append(holder);
}

search.drawSidebar = function() {
	var holder = $("<div />", {
		class: 'search_sidebar'
	});

	search.drawApps(holder);

	search.holder.append(holder);
}

search.drawApps = function(holder) {
	for(i = 0 ; i < search.apps.length; i++) {
		var a = $("<div />", {
			class: search.apps[i].class
		});

		var img = $("<img />", {
			src: search.apps[i].icon
		}).appendTo(a);

		var name = $("<span />", {
			text: search.apps[i].name
		}).appendTo(a);

		holder.append(a);
	}
}

search.drawResultsHolder = function() {
	search.results_holder = $("<div />", {
		class: 'search_results'
	});

	search.holder.append(search.results_holder);
}

search.result = function(input) {
	search.results_holder.html('');
	if (input == '') {
		search.hideResults();
		return;
	}

	// Get app search results
	results_app = appManager.find(input);

	var holder = $("<div />", {
		class: 'app_results'
	});

	if (results_app == false) {
		var span = $("<span />", {
			class: 'no_results_alert',
			text: 'No Results Found!'
		}).appendTo(holder);

	} else {
		for(i = 0 ; i < results_app.length; i++) {
			holder.append(search.drawResults(results_app[i]));
		}
	}

	search.results_holder.append(holder);
	search.showResults();
}

search.drawResults = function(result) {
	var holder = $("<div />", {
		class: 'search_input_result'
	});

	var img = $("<img />", {
		src: result.icon
	}).appendTo(holder);

	var div = $("<div />", {
		class: 'text_reform'
	});

	var name = $("<span />", {
		text: result.name
	}).appendTo(div);

	var subtext = $("<span />", {
		text: 'Desktop App'
	}).appendTo(div);

	holder.append(div);

	holder.click(function() {
		switch (result.appid) {
			case 1:
				window.open("https://github.com/HamzaEzzRa");
				break;
			case 2:
				window.open("https://tinysquidstudios.itch.io/");
				break;
			case 3:
				window.open("https://www.linkedin.com/in/hamza-ezzaoui-rahali-521730190/")
				break;
			case 4:
				window.location.href = "mailto:hamzaezzaouirahali@gmail.com";
				break;
		}
		search.hideResults();
		search.hide();
	});

	return holder;
}

search.drawInfoHolder = function() {
	var holder = $("<div />", {
		class: 'search_info',
		text: 'Start typing to search for apps, files, and settings.'
	});

	search.holder.append(holder);
}

search.toggle = function() {
	if (!search.holder.hasClass('active'))
		search.show();
	else
		search.hide();
}

search.show = function() {
	if (!search.holder.hasClass('active')) {
		search.holder.addClass('active');
		search.holder.removeClass('hide');

		search.hideOthers();
	}
}

search.hide = function() {
	if (search.holder.hasClass('active')) {
		search.holder.addClass('hide');
		search.holder.removeClass('active');

		// empty the textfield
		$(".search_btn input").val('');
	}
}

search.showResults = function() {
	if (!search.results_holder.hasClass('active')) {
		search.results_holder.addClass('active');
		search.results_holder.removeClass('hide');
	}
}

search.hideResults = function() {
	if (search.results_holder.hasClass('active')) {
		search.results_holder.addClass('hide');
		search.results_holder.removeClass('active');
	}
}

search.showMenu = function() {
	var menu = $('.search_sidebar');
	if (!menu.hasClass('active')) {
		menu.addClass('active');
		menu.removeClass('hide');

		$('.search_sidebar span').css('display', 'inline-block');
	}
}

search.focus = function() {
	search.input.focus();
}

search.hideOthers = function() {
	options.clearMenus();
	start.hide();
}

search.init = function() {
	search.drawHolder();
	search.drawSidebar();
	search.drawInfoHolder();
	search.drawResultsHolder();
}


