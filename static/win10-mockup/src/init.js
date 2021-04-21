$(function() {
	stopDefaultContextMenu();

	home.init(() => {});
});

function stopDefaultContextMenu() {
	$("body").on("contextmenu", function(evt) {
		options.init(evt);
		return false;
	});
}