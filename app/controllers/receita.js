var dao = require('../dao/receita')();

const REQUEST_INVALIDO = { 'mensagem': 'Request inválido' };

module.exports = (app) => {
    var controller = {};

    controller.adicionaReceita = (req, res) => {
        let receita = req.body;

        if (!receita.nome || !receita.rendimento || !receita.valorVenda || !receita.materiais || !receita.materiais.length > 0) {
            res.status(400).json(REQUEST_INVALIDO);
        } else {
            dao.adicionaReceita(receita, (result) => {
                if (!result.resultado) {
                    return res.status(500).json({
                        'mensagem': 'Erro ao inserir a receita na base de dados',
                        'erro': result.erro
                    })
                }
                res.status(200).json({ ...result.data })
            });
        }
    };

    controller.listarReceitas = (req, res) => {
        dao.listarReceitas((result) => {
            if (!result.resultado) {
                return res.status(500).json({
                    'mensagem': 'Erro ao listar as receitas na base de dados',
                    'erro': result.erro
                })
            }
            res.status(200).json(result.data)
        });
    };


    controller.carregarHistoricoReceita = (req, res) => {
        let codigo = req.params.codigo;

        dao.carregarHistoricoReceita(codigo, (result) => {
            if (!result.resultado) {
                return res.status(500).json({
                    mensagem: `Erro ao carregar histórico da receita ${codigo}`,
                    erro: result.erro
                })
            }
            res.status(200).json(result.data)
        })
    };

    controller.alterarReceita = (req, res) => {
        let request = req.body
        dao.alterarReceita(request, (result) => {
            if (!result.resultado) {
                return res.status(500).json({
                    mensagem: `Erro ao alterar receita ${request.codigo}`,
                    erro: result.erro
                })

                return res.status(500).json(result.data);
            }

            res.status(200).json(result.data);
        })
    };

    return controller;
};