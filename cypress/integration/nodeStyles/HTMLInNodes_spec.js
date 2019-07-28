describe('nodeStyles - HTMLInNodes', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/HTMLInNodes.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});