describe('nodeStyles - customGroups', function() {
	
	it('match screenshot', function () {
		cy.visit('/examples/network/nodeStyles/customGroups.html').then(() => {
			cy.wait(500).then(() => {
				cy.get('.vis-network').first().matchImageSnapshot();
			});
		});
	});

});