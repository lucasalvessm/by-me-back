module.exports = Object.freeze({

    //materiais
    BUSCA_MAIOR_CODIGO_MATERIAL: 'select max(codigo) codigo from materiais',
    LISTAR_MATERIAIS: 'select id, codigo, nome, custo, observacao, data_cadastro as dataCadastro, peso, versao from materiais m where not exists (select 1 from materiais m2 where m.codigo = m2.codigo and m2.versao > m.versao)',
    ADICIONAR_MATERIAL: 'insert into materiais (nome, codigo, custo, observacao, data_cadastro, peso, versao) values (?, ?, ?, ?, ?, ?, ?)',
    BUSCA_HISTORICO_MATERIAL: 'select id, codigo, nome, custo, observacao, data_cadastro dataCadastro, peso, versao from materiais where codigo = ? order by versao desc',
    BUSCAR_HISTORICO_RECEITA_BY_MATERIAL: 'select * from produtos_materiais pm where pm.produto_codigo in (select pm2.produto_codigo from produtos_materiais pm2 where pm2.material_codigo = ? )',
    ATUALIZAR_MATERIAIS_PRODUTO_MATERIAIS: 'update produtos_materiais set material_versao = ? where material_codigo = ?',
    BUSCAR_PRODUTOS_PRODUTOS_MATERIAIS_BY_MATERIAL: 'select produto_codigo from produtos_materiais where material_codigo = ?',
    ATUALIZAR_PRODUTOS_PRODUTO_MATERIAIS: 'update produtos_materiais set produto_versao = produto_versao+1 where produto_codigo = ?',
    ATUALIZAR_VERSAO_PRODUTOS: 'insert into produtos (codigo, versao, nome, rendimento, valor_venda, modo_preparo) values ?',
    BUSCAR_PRODUTOS: 'select versao, codigo, nome, rendimento, valor_venda, modo_preparo from produtos p where codigo in ( ? ) and versao = (select max(p2.versao) from produtos p2 where p2.codigo = p.codigo)',

    //receitas
    BUSCA_MAIOR_CODIGO_RECEITA: 'select max(codigo) codigo from produtos',
    LISTAR_RECEITAS: 'select m.id as materialId, m.codigo as materialCodigo, m.nome as materialNome, m.custo as materialCusto, m.observacao as materialObservacao, m.data_cadastro as materialDataCadastro, m.peso as materialPeso, m.versao as materialVersao, p.id as produtoId, p.data_cadastro as produtoDataCadastro, p.codigo as produtoCodigo, p.versao as produtoVersao, p.nome as produtoNome, p.rendimento as produtoRendimento, p.valor_venda as produtoValorVenda, p.modo_preparo as produtoModoPreparo, pm.quantidade_material as materialQuantidade from produtos_materiais pm, materiais m, produtos p where pm.produto_codigo = p.codigo and pm.material_codigo = m.codigo and pm.produto_versao = p.versao and pm.material_versao = m.versao order by pm.produto_codigo',
    ADICIONAR_RECEITA: 'insert into produtos (codigo, versao, nome, rendimento, valor_venda, modo_preparo, data_cadastro) values (?, ?, ?, ?, ?, ?, ?)',
    ADICIONAR_MATERIAIS_RECEITA: 'insert into produtos_materiais (materiais_id, material_codigo, material_versao, quantidade_material, produtos_id, produto_codigo, produto_versao) values ?',
    BUSCA_HISTORICO_RECEITA: 'select m.codigo as materialCodigo, m.nome as materialNome, p.codigo as produtoCodigo, p.versao as produtoVersao, m.custo as materialCusto, m.observacao as materialObservacao, m.data_cadastro as materialDataCadastro, m.peso as materialPeso, p.data_cadastro as produtoDataCadastro, p.nome as produtoNome, p.rendimento as produtoRendimento, p.valor_venda as produtoValorVenda, p.modo_preparo as produtoModoPreparo, pm.quantidade_material as materialQuantidade from produtos_materiais_historico pm, materiais m, produtos p where pm.produto_codigo = p.codigo and pm.material_codigo = m.codigo and pm.produto_codigo = ? and pm.produto_versao = p.versao and pm.material_versao = m.versao order by pm.produto_versao desc',
    BUSCAR_RECEITA: 'select quantidade_material, material_versao, material_codigo, produto_codigo, produto_versao from produtos_materiais pm where pm.produto_codigo = ?',
    ADICIONAR_MATERIAIS_RECEITA_HISTORICO: 'insert into produtos_materiais_historico (quantidade_material, material_versao, material_codigo, produto_codigo, produto_versao) values ?',
    EXCLUIR_REGISTRO_PRODUTO_MATERIAL: 'delete from produtos_materiais where produto_codigo = ?'
});