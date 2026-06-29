const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');

router.get('/', auth, getClients);
router.get('/:id', auth, getClientById);
router.post('/', auth, createClient);
router.put('/:id', auth, updateClient);
router.delete('/:id', [auth, admin], deleteClient);

module.exports = router;