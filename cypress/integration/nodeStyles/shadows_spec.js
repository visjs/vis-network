describe('nodeStyles - shadows', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/shadows.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});