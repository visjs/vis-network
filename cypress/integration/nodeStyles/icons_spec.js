describe('nodeStyles - icons', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/icons.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('#mynetworkFA').first().matchImageSnapshot('nodeStyles - icons FontAwesome -- match screenshot');
				cy.get('#mynetworkIO').first().matchImageSnapshot('nodeStyles - icons Ionicons -- match screenshot');
			});
		});
	});

});