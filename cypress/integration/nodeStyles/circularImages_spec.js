describe('nodeStyles - circularImages', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/circularImages.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});