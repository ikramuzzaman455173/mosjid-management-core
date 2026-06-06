-- Migration: Re-seed permissions exactly matching the sidebar menu and prune unnecessary actions.
-- Important: Deleting from permissions will cascade and delete associated role_permissions.
DELETE FROM permissions;

WITH perms (module, action, description) AS (
    VALUES
    ('Dashboard', 'View', 'View dashboard statistics'),
    
    ('Members', 'View', 'View member list'),
    ('Members', 'Create', 'Add new members'),
    ('Members', 'Edit', 'Edit member details'),
    ('Members', 'Delete', 'Remove members'),

    ('Monthly Chanda', 'View', 'View subscriptions'),
    ('Monthly Chanda', 'Create', 'Collect subscriptions'),
    ('Monthly Chanda', 'Edit', 'Edit subscriptions'),
    ('Monthly Chanda', 'Delete', 'Delete subscriptions'),

    ('Donations & Zakat', 'View', 'View donations'),
    ('Donations & Zakat', 'Create', 'Add donations'),
    ('Donations & Zakat', 'Edit', 'Edit donations'),
    ('Donations & Zakat', 'Delete', 'Delete donations'),

    ('Income & Expense', 'View', 'View transactions'),
    ('Income & Expense', 'Create', 'Add transactions'),
    ('Income & Expense', 'Edit', 'Edit transactions'),
    ('Income & Expense', 'Delete', 'Delete transactions'),

    ('Cash Management', 'View', 'View cash records'),
    ('Cash Management', 'Create', 'Add cash entry'),
    ('Cash Management', 'Edit', 'Edit cash entry'),
    ('Cash Management', 'Delete', 'Delete cash entry'),

    ('Bank & Mobile Banking', 'View', 'View bank records'),
    ('Bank & Mobile Banking', 'Create', 'Add bank entry'),
    ('Bank & Mobile Banking', 'Edit', 'Edit bank entry'),
    ('Bank & Mobile Banking', 'Delete', 'Delete bank entry'),

    ('Assets', 'View', 'View assets'),
    ('Assets', 'Create', 'Add assets'),
    ('Assets', 'Edit', 'Edit assets'),
    ('Assets', 'Delete', 'Delete assets'),

    ('Inventory', 'View', 'View inventory'),
    ('Inventory', 'Create', 'Add inventory item'),
    ('Inventory', 'Edit', 'Edit inventory item'),
    ('Inventory', 'Delete', 'Delete inventory item'),

    ('Meetings', 'View', 'View meetings'),
    ('Meetings', 'Create', 'Create meeting'),
    ('Meetings', 'Edit', 'Edit meeting'),
    ('Meetings', 'Delete', 'Delete meeting'),

    ('Notice Board', 'View', 'View notices'),
    ('Notice Board', 'Create', 'Create notice'),
    ('Notice Board', 'Edit', 'Edit notice'),
    ('Notice Board', 'Delete', 'Delete notice'),

    ('Prayer Schedule', 'View', 'View prayer times'),
    ('Prayer Schedule', 'Edit', 'Edit prayer times'),

    ('Events', 'View', 'View events'),
    ('Events', 'Create', 'Create event'),
    ('Events', 'Edit', 'Edit event'),
    ('Events', 'Delete', 'Delete event'),

    ('Qurbani', 'View', 'View qurbani records'),
    ('Qurbani', 'Create', 'Add qurbani record'),
    ('Qurbani', 'Edit', 'Edit qurbani record'),
    ('Qurbani', 'Delete', 'Delete qurbani record'),

    ('Ramadan', 'View', 'View ramadan activities'),
    ('Ramadan', 'Create', 'Add ramadan activity'),
    ('Ramadan', 'Edit', 'Edit ramadan activity'),
    ('Ramadan', 'Delete', 'Delete ramadan activity'),

    ('Gallery', 'View', 'View gallery'),
    ('Gallery', 'Create', 'Upload images'),
    ('Gallery', 'Delete', 'Delete images'),

    ('Reports', 'View', 'View reports'),
    ('Reports', 'Export', 'Export reports'),

    ('User Management', 'View', 'View users'),
    ('User Management', 'Create', 'Add users'),
    ('User Management', 'Edit', 'Edit users'),
    ('User Management', 'Delete', 'Delete users'),

    ('Role & Permission', 'View', 'View roles'),
    ('Role & Permission', 'Create', 'Create roles'),
    ('Role & Permission', 'Edit', 'Edit roles'),
    ('Role & Permission', 'Delete', 'Delete roles'),

    ('Audit Logs', 'View', 'View audit logs'),
    ('Audit Logs', 'Export', 'Export audit logs'),

    ('Settings', 'View', 'View system settings'),
    ('Settings', 'Edit', 'Edit system settings')
)
INSERT INTO permissions (module, action, description)
SELECT module, action, description FROM perms;

-- Optional: Automatically assign all new permissions to super_admin visually
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;
