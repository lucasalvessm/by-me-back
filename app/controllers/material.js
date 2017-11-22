var dao = require('../dao/material')();

const REQUEST_INVALIDO = { 'mensagem': 'Request inválido' };

module.exports = (app) => {
    var controller = {};

    controller.adicionaMaterial = (req, res) => {
        let material = req.body;

        if (!material.nome || !material.custo || !material.peso) {
            res.status(400).json(REQUEST_INVALIDO);
        } else {
            material.dataCadastro = new Date();

            dao.adicionaMaterial(material, (result) => {
                if (!result.resultado) {
                    res.status(500).json({
                        'mensagem': 'Erro ao inserir o material na base de dados',
                        'erro': result.erro
                    })
                }
                res.status(200).json({
                    data: {
                        ...result.data
                    }
                })
            });
        }
    };

    controller.listarMateriais = (req, res) => {
        dao.listarMateriais((result) => {
            if (!result.resultado) {
                res.status(500).json({
                    mensagem: 'Erro ao listar os materiais',
                    erro: result.erro
                })

            }
            result.data.dataCadastro = result.data.data_cadastro;

            res.json({ data: result.data })
        })
    };

    controller.carregarHistoricoMaterial = (req, res) => {
        let codigo = req.params.codigo;

        dao.carregarHistoricoMaterial(codigo, (result) => {
            if (!result.resultado) {
                res.status(500).json({
                    mensagem: `Erro ao carregar histórico do matrial ${codigo}`,
                    erro: result.erro
                })
            }
            res.json({ data: result.data })
        })
    };

    controller.alterarMaterial = (req, res) => {
        let material = req.body;

        dao.alterarMaterial(material, (result) => {
            if (!result.resultado) {
                res.status(500).json({
                    mensagem: `Erro ao alterar material`,
                    erro: result.erro
                })
            }
            res.status(200).json({ data: result.data })
        })
    };

    return controller;
};