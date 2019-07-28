describe('nodeStyles - images', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/images.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});