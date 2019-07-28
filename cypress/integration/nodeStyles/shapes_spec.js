describe('nodeStyles - shapes', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/shapes.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});