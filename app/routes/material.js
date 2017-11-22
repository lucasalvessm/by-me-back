module.exports = (app) => {
	var controller = app.controllers.material;

	app.route('/materiais')
		.post(controller.adicionaMaterial)
		.get(controller.listarMateriais)
		.put(controller.alterarMaterial)
	app.route('/materiais/:codigo')
	//  .delete(controller.removeMaterial)
		.get(controller.carregarHistoricoMaterial)
};