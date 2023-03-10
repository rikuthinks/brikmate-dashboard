import type { NextApiRequest, NextApiResponse, PageConfig } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"
import { VectorDBQAChain } from "langchain/chains"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI } from "langchain/llms"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PineconeStore } from "langchain/vectorstores"

import { prisma } from "@/lib/db"
import { fileConsumer, formidablePromise } from "@/lib/formidable"
import { getTextContentFromPDF } from "@/lib/pdf"

const PINECONE_INDEX_NAME = "brikmate"

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false,
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chunks: never[] = []

  const { fields, files } = await formidablePromise(req, {
    ...formidableConfig,
    // consume this, otherwise formidable tries to save the file to disk
    fileWriteStreamHandler: () => fileConsumer(chunks),
  })

  const fileData = Buffer.concat(chunks)
  const openaiApiKey = fields["openai-api-key"]
  const pineconeApiKey = fields["pinecone-api-key"]

  const { file } = files
  let fileText = ""

  switch (file.mimetype) {
    case "text/plain":
      fileText = fileData.toString()
      break
    case "application/pdf":
      fileText = await getTextContentFromPDF(fileData)
      break
    case "application/octet-stream":
      fileText = fileData.toString()
      break
    default:
      throw new Error("Unsupported file type.")
  }

  const rawDocs = new Document({
    pageContent: fileText,
  })
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2400,
    chunkOverlap: 200,
  })
  const docs = textSplitter.splitDocuments([rawDocs])

  const pinecone = new PineconeClient()
  await pinecone.init({
    environment: "us-east1-gcp",
    apiKey: pineconeApiKey,
  })

  const index = pinecone.Index(PINECONE_INDEX_NAME)
  const vectorStore = await PineconeStore.fromDocuments(
    index,
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: openaiApiKey,
      batchSize: 256,
    })
  )

  const model = new OpenAI({
    openAIApiKey: openaiApiKey,
    temperature: 0,
  })

  const chain = VectorDBQAChain.fromLLM(model, vectorStore)

  const res_property_address = await chain.call({
    query:
      "What's the address of the property on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_property_address.text)

  const res_property_desc = await chain.call({
    query: "Give me a description of the premises on this lease agreement",
  })

  console.log(res_property_desc.text)

  const res_tenant_name = await chain.call({
    query:
      "What is the name, and only the name, of the tenant named in the Schedule? Provide the answer or value only as a concise response.",
  })

  console.log(res_tenant_name.text)

  const res_tenant_contact_info = await chain.call({
    query:
      "Let's work this out in a step by step way to be sure we have the right answer. What is the contact information of the tenant? This can be an email address, phone number, or mailing address. Provide the answer or value only as a concise response.",
  })

  console.log(res_tenant_contact_info.text)

  const res_landlord_name = await chain.call({
    query:
      "Let's work this out in a step by step way to be sure we have the right answer. What is the name, and only the name, of the landlord named in the Schedule? Provide the answer or value only as a concise response.",
  })

  console.log(res_landlord_name.text)

  const res_landlord_contact_info = await chain.call({
    query:
      "Let's work this out in a step by step way to be sure we have the right answer. What is the contact information of the landlord? This can be an email address, phone number, or mailing address. Provide the answer or value only as a concise response.",
  })

  console.log(res_landlord_contact_info.text)

  const res_lease_start_date = await chain.call({
    query:
      "Let's work this out in a step by step way to be sure we have the right answer. What is the start date of this lease? Provide the answer or value only as a concise response.",
  })

  console.log(res_lease_start_date.text)

  const res_lease_end_date = await chain.call({
    query:
      "Let's work this out in a step by step way to be sure we have the right answer. What is the end date of this lease? Provide the answer or value only as a concise response.",
  })

  console.log(res_lease_end_date.text)

  // Renewal options and associated terms
  const res_renewal_options = await chain.call({
    query:
      "What are the renewal options and associated terms on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_renewal_options.text)

  // Rent amount
  const res_rent_amount = await chain.call({
    query:
      "What is the rent amount and payment schedule on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_rent_amount.text)

  // Rent payment schedule
  const res_rent_payment_schedule = await chain.call({
    query:
      "What is the payment schedule on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_rent_payment_schedule.text)

  // Rent escalation clauses and associated calculations
  const res_rent_escalation = await chain.call({
    query:
      "What are the rent escalation clauses and associated calculations on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_rent_escalation.text)

  // Security deposit amount
  const res_security_deposit_amount = await chain.call({
    query:
      "What is the security deposit amount on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_security_deposit_amount.text)

  // Security deposit amount and requirements
  const res_security_deposit_requirements = await chain.call({
    query:
      "What is the security deposit requirements on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_security_deposit_requirements.text)

  // Permitted uses of the premises
  const res_permitted_uses = await chain.call({
    query:
      "What are the permitted uses of the premises on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_permitted_uses.text)

  // Prohibited uses of the premises
  const res_prohibited_uses = await chain.call({
    query:
      "What are the prohibited uses of the premises on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_prohibited_uses.text)

  // Restrictions on alterations, improvements, and additions
  const res_restrictions_alterations = await chain.call({
    query:
      "What are the restrictions on alterations, improvements, and additions on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_restrictions_alterations.text)

  // Requirements for maintaining the premises
  const res_maintaining_premises = await chain.call({
    query:
      "What are the requirements for maintaining the premises on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_maintaining_premises.text)

  // Insurance requirements for tenant
  const res_insurance_requirements_tenant = await chain.call({
    query:
      "What are the insurance requirements for the tenant on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_insurance_requirements_tenant.text)

  // Insurance requirements for landlord
  const res_insurance_requirements_landlord = await chain.call({
    query:
      "What are the insurance requirements for the landlord on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_insurance_requirements_landlord.text)

  // Amounts of insurance required
  const res_insurance_amounts = await chain.call({
    query:
      "What are the amounts of insurance required on this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_insurance_amounts.text)

  const res_indemnification = await chain.call({
    query:
      "What are the provisions for indemnification in this lease? Provide the answer or value only as a concise response.",
  })

  console.log(res_indemnification.text)

  const res_tenant_default = await chain.call({
    query:
      "What are the tenant default and associated remedies in this lease? Provide the answer or value only as a concise response.",
  })

  console.log(res_tenant_default.text)

  const res_landlord_default = await chain.call({
    query:
      "What are the landlord default and associated remedies in this lease? Provide the answer or value only as a concise response.",
  })

  console.log(res_landlord_default.text)

  const res_termination_provisions = await chain.call({
    query:
      "What are the termination provisions and associated notice requirements in this lease? Provide the answer or value only as a concise response.",
  })

  console.log(res_termination_provisions.text)

  const res_assignment_subletting_restrictions = await chain.call({
    query:
      "What are the restrictions on assignment and subletting in this lease? Provide the answer or value only as a concise response.",
  })

  console.log(res_assignment_subletting_restrictions.text)

  const res_landlord_approval_assignment_subletting = await chain.call({
    query:
      "What are the requirements for landlord landlord_approval of assignment or subletting outlined in this lease? Provide the answer or value only as a concise response.",
  })
  console.log(res_landlord_approval_assignment_subletting.text)

  const res_maintenance_responsibilities = await chain.call({
    query:
      "What are the responsibilities for maintaining common areas and building systems outlined in this lease? Provide the answer or value only as a concise response.",
  })
  console.log(res_maintenance_responsibilities.text)

  const res_cam = await chain.call({
    query:
      "What are the CAM charges and associated requirements outlined in this lease? Provide the answer or value only as a concise response.",
  })
  console.log(res_cam.text)

  const res_utilities = await chain.call({
    query:
      "What are the utilities and associated requirements or limitations outlined in this lease? Provide the answer or value only as a concise response.",
  })
  console.log(res_utilities.text)

  const res_dispute_resolution = await chain.call({
    query:
      "What are the dispute resolution mechanisms outlined in this lease? Provide the answer or value only as a concise response.",
  })

  console.log(res_dispute_resolution.text)

  const res_governing_law_jurisdiction = await chain.call({
    query:
      "What is the governing law and jurisdiction for this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_governing_law_jurisdiction.text)

  const res_notices = await chain.call({
    query:
      "What are the notices and associated requirements outlined in this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_notices.text)

  const res_force_majeure_provisions = await chain.call({
    query:
      "What are the force majeure provisions outlined in this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_force_majeure_provisions.text)

  const res_confidentiality_non_disclosure_provisions = await chain.call({
    query:
      "What are the confidentiality and non-disclosure provisions outlined in this lease agreement? Provide the answer or value only as a concise response.",
  })

  console.log(res_confidentiality_non_disclosure_provisions.text)

  const result = await prisma.lease.create({
    data: {
      propertyAddress: res_property_address.text,
      propertyDescription: res_property_desc.text,
      tenantName: res_tenant_name.text,
      tenantContactInfo: res_tenant_contact_info.text,
      landlordName: res_landlord_name.text,
      landlordContactInfo: res_landlord_contact_info.text,
      leaseStartDate: res_lease_start_date.text,
      leaseEndDate: res_lease_end_date.text,
      renewalOptions: res_renewal_options.text,
      rentAmount: res_rent_amount.text,
      rentPaymentSchedule: res_rent_payment_schedule.text,
      rentEscalationClauses: res_rent_escalation.text,
      securityDepositAmount: res_security_deposit_amount.text,
      securityDespositRequirements: res_security_deposit_requirements.text,
      permittedUses: res_permitted_uses.text,
      prohibitedUses: res_prohibited_uses.text,
      restrictionsAlterations: res_restrictions_alterations.text,
      maintainingPremises: res_maintaining_premises.text,
      tenantInsuranceRequirements: res_insurance_requirements_tenant.text,
      landlordInsuranceRequirements: res_insurance_requirements_landlord.text,
      insuranceAmounts: res_insurance_amounts.text,
      indemnificationProvisions: res_indemnification.text,
      tenantDefault: res_tenant_default.text,
      landlordDefault: res_landlord_default.text,
      terminationProvisions: res_termination_provisions.text,
      assignmentSublettingRestrictions:
        res_assignment_subletting_restrictions.text,
      landlordApprovalAssignmentSubletting:
        res_landlord_approval_assignment_subletting.text,
      maintenanceResponsibilities: res_maintenance_responsibilities.text,
      camCharges: res_cam.text,
      utilitiesRequirements: res_utilities.text,
      disputeResolution: res_dispute_resolution.text,
      governingLawJurisdiction: res_governing_law_jurisdiction.text,
      noticesRequirements: res_notices.text,
      forceMajeureProvisions: res_force_majeure_provisions.text,
      confidentialityProvisions:
        res_confidentiality_non_disclosure_provisions.text,
    },
  })

  res.status(200).json(result)
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

export default handler
