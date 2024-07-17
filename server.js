const express = require('express');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/interventions', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const interventionSchema = new mongoose.Schema({
    address: String,
    type: String,
    details: String,
    status: String,
    date: Date,
    location: {
        lat: Number,
        lng: Number
    }
});

const Intervention = mongoose.model('Intervention', interventionSchema);

app.use(express.json());

app.get('/api/interventions', async (req, res) => {
    const interventions = await Intervention.find();
    res.json(interventions);
});

app.post('/api/interventions', async (req, res) => {
    const newIntervention = new Intervention(req.body);
    await newIntervention.save();
    res.status(201).json(newIntervention);
});

app.put('/api/interventions/:id', async (req, res) => {
    const updatedIntervention = await Intervention.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedIntervention);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Import CSV data
const importCSV = () => {
    fs.createReadStream('path/to/your/csvfile.csv')
        .pipe(csv())
        .on('data', async (row) => {
            const intervention = new Intervention({
                address: row['Adresse'],
                type: row['Type d\'intervention'],
                details: row['Précision de l\'intervention'],
                status: row['Statut de l\'intervention'],
                date: new Date(row['Date de l\'intervention']),
                location: { lat: 0, lng: 0 } // To be updated with geocoding
            });
            await intervention.save();
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
};

importCSV();
