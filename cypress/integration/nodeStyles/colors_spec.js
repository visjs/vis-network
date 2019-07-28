describe('nodeStyles - colors', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/colors.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});