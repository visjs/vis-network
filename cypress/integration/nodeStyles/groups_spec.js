describe('nodeStyles - groups', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/groups.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});