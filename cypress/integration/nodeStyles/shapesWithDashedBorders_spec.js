describe('nodeStyles - shapesWithDashedBorders', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/shapesWithDashedBorders.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});