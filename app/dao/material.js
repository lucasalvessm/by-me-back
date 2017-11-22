var mysql = require('mysql');
var connection = require('../../config/database.js')();
var scripts = require('./scripts');

module.exports = (app) => {
    var dao = {};
    let result;

    dao.adicionaMaterial = (material, callback) => {

        _buscaMaiorCodigoMaterial((result) => {
            if (!result.resultado) {
                callback({ resultado: false, erro: result.erro })
            }
            material.codigo = result.data.codigo + 1;
            material.versao = 1;

            let inserts = [
                material.nome,
                material.codigo,
                material.custo,
                material.observacao,
                material.dataCadastro,
                material.peso,
                material.versao
            ];

            let script = mysql.format(scripts.ADICIONAR_MATERIAL, inserts);

            connection.query(script, (error, rows) => {
                if (error) {
                    console.log(error);
                    callback({ resultado: false, erro: error });
                } else {
                    callback({ resultado: true, data: { id: rows.insertId, ...material } });
                };
            });
        });
    }

    dao.listarMateriais = (callback) => {
        let query = mysql.format(scripts.LISTAR_MATERIAIS);

        connection.query(query, (error, rows) => {
            if (error) {
                console.log(error);
                callback({ resultado: false, erro: error });
            } else {
                callback({ resultado: true, data: rows });
            }
        });
    };

    dao.carregarHistoricoMaterial = (codigo, callback) => {
        let query = mysql.format(scripts.BUSCA_HISTORICO_MATERIAL, codigo);

        connection.query(query, (error, rows) => {
            if (error) {
                console.log(error);
                callback({ resultado: false, erro: error });
            } else {
                callback({ resultado: true, data: rows });
            }
        });
    };

    dao.alterarMaterial = (material, callback) => {

        try {
            salvarProdutoMateriaisNoHistorico(material, () => {
                material.versao++;

                atualizarProdutoMaterial(material, (rows) => {

                    atualizarProdutosQuePossuemMaterial(rows, () => {

                        inserirNovoMaterial(material, () => {
                            callback({ resultado: true, data: material });
                        });
                    })
                });
            });

        } catch (error) {
            console.log(error);
            callback({ resultado: false, erro: error });
        }
    }

    const atualizarProdutosQuePossuemMaterial = (rows, callback) => {

        let inserts = [];

        rows.forEach(row => inserts.push(row.produto_codigo));

        let script = mysql.format(scripts.BUSCAR_PRODUTOS, [inserts]);

        if (inserts.length > 0) {
            connection.query(script, (error, rows2) => {
                if (error) throw error;

                inserts = [];

                rows2.forEach(row => inserts.push([
                    row.codigo,
                    row.versao + 1,
                    row.nome,
                    row.rendimento,
                    row.valor_venda,
                    row.modo_preparo
                ]));


                if (rows2.length > 0) {
                    script = mysql.format(scripts.ATUALIZAR_VERSAO_PRODUTOS, [inserts]);

                    connection.query(script, (error, rows) => {
                        if (error) throw error;

                        callback();
                    });

                } else {
                    callback();
                }
            });
        } else {
            callback();
        }
    }
    const atualizarProdutoMaterial = (material, callback) => {
        let script = mysql.format(scripts.ATUALIZAR_MATERIAIS_PRODUTO_MATERIAIS, [material.versao, material.codigo]);

        connection.query(script, (error, rows) => {
            if (error) throw error;

            script = mysql.format(scripts.BUSCAR_PRODUTOS_PRODUTOS_MATERIAIS_BY_MATERIAL, material.codigo);
            connection.query(script, (error, rows2) => {
                if (error) throw error;


                if (rows2.length > 0) {
                    rows2.forEach(row => {
                        script = mysql.format(scripts.ATUALIZAR_PRODUTOS_PRODUTO_MATERIAIS, row.produto_codigo);
                        connection.query(script, (error, rows3) => {
                            if (error) throw error;
                        });
                    });
                    callback(rows2);
                } else {
                    callback(rows2);
                }
            });
        });
    }

    const salvarProdutoMateriaisNoHistorico = (material, callback) => {
        let script = mysql.format(scripts.BUSCAR_HISTORICO_RECEITA_BY_MATERIAL, material.codigo);

        connection.query(script, (error, rows) => {
            if (error) throw error;

            let multipleInserts = [];

            rows.forEach((row) => {
                multipleInserts.push([
                    row.quantidade_material,
                    row.material_versao,
                    row.material_codigo,
                    row.produto_codigo,
                    row.produto_versao
                ]);
            });

            if (multipleInserts.length > 0) {
                script = mysql.format(scripts.ADICIONAR_MATERIAIS_RECEITA_HISTORICO, [multipleInserts]);

                connection.query(script, (error, rows) => {
                    if (error) throw error;

                    callback();
                });
            } else {
                callback();
            }

        });
    }

    const inserirNovoMaterial = (material, callback) => {

        let inserts = [
            material.nome,
            material.codigo,
            material.custo,
            material.observacao,
            material.dataCadastro,
            material.peso,
            material.versao
        ]

        let script = mysql.format(scripts.ADICIONAR_MATERIAL, inserts);

        connection.query(script, (error, rows) => {
            if (error) throw error;

            callback();
        })
    }

    const _buscaMaiorCodigoMaterial = (callback) => {
        connection.query(scripts.BUSCA_MAIOR_CODIGO_MATERIAL, (error, rows) => {
            error ? callback({ resultado: false, erro: error })
                : callback({ resultado: true, data: rows[0] })
        });
    };

    return dao;
};