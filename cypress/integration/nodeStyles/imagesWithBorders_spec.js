describe('nodeStyles - imagesWithBorders', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/imagesWithBorders.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});