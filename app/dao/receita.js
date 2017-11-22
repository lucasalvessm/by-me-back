var mysql = require('mysql');
var connection = require('../../config/database.js')();
var scripts = require('./scripts');

module.exports = (app) => {
    var dao = {};
    let result;

    dao.adicionaReceita = (receita, callback) => {
        try {
            _buscaMaiorCodigoReceita((resultadoBusca) => {

                receita.codigo = resultadoBusca.codigo + 1;
                receita.versao = 1;
                adicionarReceita(receita, () => {

                    adicionarProdutosMateriais(receita, () => {

                        callback({ resultado: true, data: { ...receita } });
                    });
                });
            });

        } catch (error) {
            console.log(error);
            callback({ resultado: false, erro: error });
        }
    }

    dao.listarReceitas = (callback) => {
        connection.query(scripts.LISTAR_RECEITAS, (error, rows) => {
            if (error) {
                console.log(error);
                callback({ resultado: false, erro: error });

            } else {
                let response = [];
                let rowsCopy = rows.slice();
                let rowsUtility = rows.slice();

                do {

                    let produtoInserido = false;
                    let produto = { materiais: [] };;

                    rowsCopy && rowsCopy.length > 0 && rowsCopy.some((row) => {

                        if (!produtoInserido) {
                            produtoInserido = true;
                            produtoBuilder(produto, row);
                        }

                        if (produto.codigo !== row.produtoCodigo)
                            return true;

                        materiaisBuilder(produto, row);

                        rowsUtility.shift();
                    });

                    rowsCopy = rowsUtility.slice();
                    produto.codigo ? response.push(produto) : null;

                } while (rowsCopy.length > 0);

                callback({ resultado: true, data: [...response] });
            }
        });
    };

    dao.carregarHistoricoReceita = (codigo, callback) => {
        let query = mysql.format(scripts.BUSCA_HISTORICO_RECEITA, codigo);

        connection.query(query, (error, rows) => {
            if (error) {
                console.log(error);
                callback({ resultado: false, erro: error });
            } else {
                let response = [];
                let rowsCopy = rows.slice();
                let rowsUtility = rows.slice();

                do {

                    let produtoInserido = false;
                    let produto = { materiais: [] };

                    rowsCopy && rowsCopy.length > 0 && rowsCopy.some((row) => {

                        if (!produtoInserido) {
                            produtoInserido = true;
                            produtoBuilder(produto, row);
                        }

                        if (produto.versao !== row.produtoVersao)
                            return true;

                        materiaisBuilder(produto, row);

                        rowsUtility.shift();
                    });

                    rowsCopy = rowsUtility.slice();
                    produto.codigo ? response.push(produto) : null;

                } while (rowsCopy.length > 0);

                callback({ resultado: true, data: [...response] });
            }
        });
    };

    dao.alterarReceita = (receita, callback) => {

        try {
            transferirReceitaMaterialParaHistorico(receita.codigo, () => {

                excluirRegistroReceitaMaterial(receita.codigo, () => {

                    receita.versao++;
                    adicionarReceita(receita, () => {

                        adicionarProdutosMateriais(receita, () => {

                            callback({ resultado: true, data: receita });

                        });
                    });
                });
            });




        } catch (error) {
            console.log(error);
            callback({ resultado: false, erro: error });
        }


    };

    const adicionarProdutosMateriais = (receita, callback) => {
        let materiaisInsert = [];

        receita.materiais.map((material) => {
            let insertBuilder = [
                null,
                material.codigo,
                material.versao,
                material.quantidade,
                null,
                receita.codigo,
                receita.versao
            ];

            materiaisInsert.push(insertBuilder);
        });

        script = mysql.format(scripts.ADICIONAR_MATERIAIS_RECEITA, [materiaisInsert]);

        connection.query(script, (error, rows) => {
            if (error) throw error;

            callback();
        });
    }

    const adicionarReceita = (receita, callback) => {

        receita.dataCadastro = new Date();
        
        let insert = prepareToInsertReceita(receita);

        let script = mysql.format(scripts.ADICIONAR_RECEITA, insert);

        connection.query(script, (error, rows) => {
            if (error) throw error;

            callback();
        });
    }

    const transferirReceitaMaterialParaHistorico = (codigo, callback) => {
        let script = mysql.format(scripts.BUSCAR_RECEITA, [codigo]);

        connection.query(script, (error, rows) => {
            if (error) throw error;

            let inserts = [];

            rows.forEach((row) => {
                inserts.push([
                    row.quantidade_material,
                    row.material_versao,
                    row.material_codigo,
                    row.produto_codigo,
                    row.produto_versao
                ])
            });

            script = mysql.format(scripts.ADICIONAR_MATERIAIS_RECEITA_HISTORICO, [inserts]);

            connection.query(script, (error, rows) => {
                if (error) throw error;

                callback();
            })
        });
    }

    const excluirRegistroReceitaMaterial = (codigo, callback) => {
        let script = mysql.format(scripts.EXCLUIR_REGISTRO_PRODUTO_MATERIAL, [codigo]);

        connection.query(script, (error, rows) => {
            if (error) throw error;

            callback();
        });
    }

    const produtoBuilder = (produto, row) => {
        produto.id = row.produtoId;
        produto.codigo = row.produtoCodigo;
        produto.versao = row.produtoVersao;
        produto.nome = row.produtoNome;
        produto.rendimento = row.produtoRendimento;
        produto.valorVenda = row.produtoValorVenda;
        produto.modoPreparo = row.produtoModoPreparo;
        produto.dataCadastro = row.produtoDataCadastro;
    }

    const materiaisBuilder = (produto, row) => {
        produto.materiais.push({
            id: row.materialId,
            codigo: row.materialCodigo,
            nome: row.materialNome,
            quantidade: row.materialQuantidade,
            custo: row.materialCusto,
            observacao: row.materialObservacao,
            dataCadastro: row.materialDataCadastro,
            peso: row.materialPeso,
            versao: row.materialVersao
        });
    }

    const prepareToInsertReceita = (receita) => {
        return [
            receita.codigo,
            receita.versao,
            receita.nome,
            receita.rendimento,
            receita.valorVenda,
            receita.modoPreparo,
            receita.dataCadastro
        ];
    }

    const _buscaMaiorCodigoReceita = (callback) => {
        connection.query(scripts.BUSCA_MAIOR_CODIGO_RECEITA, (error, rows) => {
            if (error) throw error;

            callback(rows[0]);
        });
    };

    return dao;
};