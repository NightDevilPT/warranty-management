# Warranty Management System - Admin Flow

## Table of Contents
1.  [Overview](#overview)
2.  [Core Concepts: Roles vs. Permissions](#core-concepts-roles-vs-permissions)
3.  [Key Features](#key-features)
    *   [Dynamic Forms](#dynamic-forms)
    *   [Dynamic Warranty Templates](#dynamic-warranty-templates)
    *   [Dynamic Personas & Permissions](#dynamic-personas--permissions)
    *   [Custom Email Templates](#custom-email-templates)
4.  [System Admin Flow](#system-admin-flow)
    *   [Company Onboarding Process](#company-onboarding-process)
5.  [User & Partner Invitation Flow](#user--partner-invitation-flow)
6.  [User Roles & Permission Logic](#user-roles--permission-logic)
    * [Database Schema Diagram](#database-schema-diagram)
    * [User & Organization Flow Diagram](#user--organization-flow-diagram)
    * [Permission Inheritance Flow](#permission-inheritance-flow)
    * [Organization Hierarchy Flow](#organization-hierarchy-flow)

---

## Overview

The Warranty Management System is a platform that enables companies to manage their warranty processes through a fully customizable portal. Companies can define their specific requirements for product registration, claims, user roles, and dynamic forms.

The onboarding process begins with our Admin team gathering the company's requirements. Using the admin portal, we then configure the company's organization, settings, and initial user accounts. Once setup is complete, the company's designated Super Admin gains full control to further customize and manage their portal, partners, and consumers.

## Key Features

### Dynamic Forms
*   Generate custom forms tailored to a company's specific data collection needs.
*   Supported form types include:
    *   Product Form
    *   Warranty Registration Form
    *   Claim Form
    *   Issues Form
    *   Categories Form
    *   Fault Form
    *   Brand Form
    *   ...and more as required.

### Dynamic Warranty Templates
*   Companies can define multiple warranty types, and the system dynamically generates the corresponding templates.
*   When a company adds a product, the relevant warranty template becomes available for partners or admins to attach.
*   During consumer registration, selecting a product automatically attaches its associated warranty.
*   Templates support custom terms, conditions, and rules that are validated upon registration.

### Dynamic Personas & Permissions
*   Companies can create **custom personas** (e.g., Dealer, Installer, Retailer, Repairer) to represent different partner types.
*   Company admins can assign granular permissions (e.g., `CAN_DO_REGISTRATION`, `CAN_DO_CLAIMS`, `CAN_INVITE_PARTNER`) to these personas.
*   Only the Company Super Admin has full CRUD rights for managing personas and permissions.
*   When inviting a new partner, the admin selects a persona to assign, which automatically grants the associated permissions upon signup.

### Custom Email Templates
*   Company Super Admins can create and customize email templates for system events.
*   Supported events include: `REGISTRATION_CREATED`, `CLAIM_CREATED`, `CLAIM_UPDATED`, `REGISTRATION_UPDATED`, etc.
*   Each template supports dynamic variables for the subject, HTML content, and body.

## System Admin Flow

The platform has a single, overarching **System Admin** role with full control over the entire application. This account can be managed or terminated even while the server is running.

The System Admin is responsible for onboarding new companies based on their gathered requirements.

### Company Onboarding Process

1.  **Organization Creation**
    The Admin creates the company's organization, providing details such as:
    `[firstname, lastname, username, orgName, phone, address, email, info: {logo, currency, etc}]`

2.  **Schema Setup**
    The Admin creates the initial set of dynamic form schemas required by the company, such as:
    *   Claim
    *   Category
    *   Brand
    *   Product
    *   Registration
    *   Customer

3.  **Warranty Template Setup**
    The Admin defines the company's warranty templates, configuring:
    *   `warrantyType`
    *   Validation `rules`
    *   `info` (e.g., label, description)
    *   `terms` (e.g., label, description)

4.  **Super Admin Invitation**
    The System Admin assigns a user as the **Company Super Admin**. The system automatically sends this user an email invitation to sign up, set their password, and verify their account.

5.  **Super Admin Handover**
    Once the Company Super Admin completes signup, they gain full administrative control over their company's portal, including the ability to manage products, partners, and further customize all settings.

## User & Partner Invitation Flow

The process for adding new users (both Super Admins and Partners) is streamlined:

1.  **Invitation:** An Admin or Super Admin adds a user with details (name, email, organization).
2.  **Email Trigger:**
    *   A **Company Super Admin** receives an onboarding email to sign up and verify their account.
    *   A **Company Partner** receives an invitation email to join the organization.
3.  **Account & Org Setup:** During signup, the system:
    *   Creates the user's account.
    *   For partners, it creates a new child organization with default settings.
    *   Links the new organization to the parent company by setting its `rootOrgId`.
4.  **Permission Granting:** The user is automatically assigned the permissions associated with the role and persona they were invited under.

**NOTE:** When we add a user, we create one organization for this user and connect the two to each other. The same user can have multiple organizations, allowing the user to maintain relationships with multiple organizations. For example: `user -> {rootOrgId, orgId, role: ROLE[]}[]`

Here's the corrected document with proper internal/external clarification:

## User Roles & Permission Logic

The platform operates with four distinct user roles:

- **SUPER_ADMIN**
  - Access: `Admin Portal`, `Company Portal`, `Consumer Portal`
  - Full administrative control over the platform, including company onboarding, warranty templates, form schemas, and claims workflows.
  - Manages all onboarded companies and their configurations.
  - **Access Scope**: Global access to all companies and system data.

- **COMPANY_SUPER_ADMIN**
  - Access: `Company Portal`
  - Acts as the primary administrator for a company upon onboarding.
  - Creates and manages custom personas (e.g., Warranty Manager, Dealer, Support Agent) and assigns granular permissions.
  - Can designate additional company admin roles via custom personas.
  - **Access Scope**: Full access within their company organization.
  - **Note**: Each company is limited to one primary COMPANY_SUPER_ADMIN.

- **COMPANY_PARTNER**
  - Access: `Company Portal` (restricted view)
  - Represents both:
    - **Internal Staff**: Employees working directly for the company (e.g., Warranty Managers, Support Agents, Quality Auditors), linked to the main company organization.
    - **External Partners**: Separate businesses collaborating with the company (e.g., Dealers, Retailers, Installers, Service Centers), each with their own organization linked to the parent company.
  - Operates with permissions assigned by the COMPANY_SUPER_ADMIN via custom personas.
  - **Internal Staff Access**: Operates within the main company organization, accessing company-wide data as permitted.
  - **External Partner Access**: Operates within their own organization, with access limited to their organization’s data.
  - **Key Clarification**: Both internal staff and external partners use the **COMPANY_PARTNER** role but differ in their organizational relationships:
    - **Internal Staff**: Directly linked to the main company organization (`orgId` matches the company’s `orgId`).
    - **External Partners**: Linked to a separate child organization with a unique `orgId` and connected to the parent via `rootOrgId`.
  - **Access Scope**: Permission-based access within their respective organization.

- **CONSUMER**
  - Access: `Consumer Portal`
  - End-customer interacting with the consumer portal for product registration, claim initiation, and other customer-facing tasks.
  - **Access Scope**: Limited to their own registered products and claims.

