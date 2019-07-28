describe('nodeStyles - widthHeight', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/widthHeight.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});