const express = require('express')
const router = express.Router()
const Aposta = require('../modelos/aposta')
const { paginate } = require('../paginacao')
const { body } = require('express-validator')
const validarRequisicao = require('../validacao')
const { Op } = require('sequelize')

router.get('/', async (req, res) => {
    const { evento, page, pageSize } = req.query
    const apostas = await paginate(
        Aposta, 
        parseInt(page || 1), 
        parseInt(pageSize || 5),
        {
            evento: { [Op.like]: `%${evento}%` }
        }
    );    
    return res.send(apostas)
})

router.get('/:id', async (req, res) => {
    const id = req.params.id
    const aposta = await Aposta.findByPk(id)
    if (!aposta) {
        return res.status(404).send('Aposta não encontrada!')
    }
    res.send(aposta)
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id
    const aposta = await Aposta.findByPk(id)
    if (!aposta) {
        return res.status(404).send('Aposta não encontrada!')
    }
    aposta.destroy()
    return res.send(aposta)
})

router.patch('/:id', async (req, res) => {
    const id = req.params.id
    const aposta = await Aposta.findByPk(id)
    if (!aposta) {
        return res.status(404).send('Aposta não encontrada!')
    }
    const { idCliente, evento, valor } = req.body
    if (idCliente) {
        aposta.idCliente = idCliente
    }
    if (evento) {
        aposta.evento = evento
    }
    if (valor) {
        aposta.valor = valor
    }
    aposta.save();
    return res.send(aposta)
})

router.post(
    '/',
    body('evento')
    .notEmpty()
    .withMessage('Tem que ter o nome do evento'),
    body('valor')
        .isDecimal({ min: 0 })
        .withMessage('Valor inválido'),
    validarRequisicao,
    async (req, res) => {
        const { idCliente, evento, valor } = req.body
        const aposta = await Aposta.create({ idCliente, evento, valor })
        return res.send(aposta)
    }
)

module.exports = router