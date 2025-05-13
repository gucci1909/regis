import express from 'express';
import apiLimiter from '../../middleware/rateLimiter.js';
import { getDb } from '../../config/mongodb.js';
import dotenv from 'dotenv';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('envFilePath', {
    alias: 'e',
    describe: 'Path to the .env file',
    type: 'string',
    demandOption: true,
  })
  .option('mode', {
    alias: 'm',
    describe: 'Application mode (e.g., development, production)',
    type: 'string',
  })
  .parse();

dotenv.config({ path: argv.envFilePath });

const router = express.Router();
router.use(apiLimiter);

// POST /api/projects/adding-projects
router.post('/adding-projects', async (req, res) => {
  try {
    const db = getDb();
    const projects = db.collection('projects');

    const {
      name,
      slug,
      location,
      status,
      possession_date,
      floor_plan_url,
      short_description,
      full_description,
      marketing_pitches,
      awards,
      design_features,
      quality_certifications,
      cover_image,
      gallery_images,
      unit_types,
      total_units,
      bedroom_variants,
      price_range,
      availability_status,
      amenities,
      faq_list,
      contact_person,
      contact_email,
      contact_number,
      whatsapp_number,
      commission_structure,
      incentives,
      special_notes,
      documents_required,
      project_training_material,
    } = req.body;

    // Basic validation
    if (!name || !location || !short_description || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await projects.insertOne({
      name,
      slug,
      location,
      status,
      possession_date,
      floor_plan_url,
      short_description,
      full_description,
      marketing_pitches,
      awards,
      design_features,
      quality_certifications,
      cover_image,
      gallery_images,
      unit_types,
      total_units,
      bedroom_variants,
      price_range,
      availability_status,
      amenities,
      faq_list,
      contact_person,
      contact_email,
      contact_number,
      whatsapp_number,
      commission_structure,
      incentives,
      special_notes,
      documents_required,
      project_training_material,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({ message: 'Project added successfully', projectId: result.insertedId });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/all-project-names', async (req, res) => {
  try {
    const db = getDb();
    const projects = db.collection('projects');

    const projectNames = await projects.find({}, { projection: { name: 1 } }).toArray();

    const names = projectNames.map((p) => p.name);

    res.status(200).json({ names });
  } catch (error) {
    console.error('Error fetching project names:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:projectName', async (req, res) => {
  try {
    const db = getDb();
    const projects = db.collection('projects');

    const { projectName } = req.params;

    const project = await projects.findOne({ name: projectName });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
