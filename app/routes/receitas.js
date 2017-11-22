module.exports = (app) => {
	var controller = app.controllers.receita;

	app.route('/receitas')
		.post(controller.adicionaReceita)
		.get(controller.listarReceitas)
		.put(controller.alterarReceita)
	app.route('/receitas/:codigo')
		.get(controller.carregarHistoricoReceita)
};