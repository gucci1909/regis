import express from 'express';
import domesticCompanyRouter from './DomesticCompany.js';
import internationalCompanyRouter from './InternationalCompany.js';
import individualDomesticRouter from "./IndividualDomestic.js";
import individualInternationalRouter from "./IndividualInternational.js";

const router = express.Router();

router.use('/company', domesticCompanyRouter);
router.use('/company', internationalCompanyRouter);
router.use('/company', individualDomesticRouter);
router.use('/company', individualInternationalRouter)

export default router;
