import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Agent Workflow Feature
 *
 * Tests the complete workflow builder functionality including:
 * - Loading existing workflows
 * - Creating new workflows from templates
 * - Editing workflow nodes and edges
 * - Saving workflows to database
 * - Verifying persistence across page reloads
 */

// Test credentials
const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

// Test agent ID (Sarah - General Fundraising)
const TEST_AGENT_ID = '64398860-2b73-4e1f-905c-9887aca877a8';

test.describe('Agent Workflow Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/sign-in');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/home/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/home/);

    console.log('✓ Logged in successfully');

    // Close onboarding dialog if it appears
    try {
      const skipButton = page.locator(
        'button:has-text("Skip"), button:has-text("No thanks")',
      );
      const isVisible = await skipButton.isVisible({ timeout: 2000 });
      if (isVisible) {
        await skipButton.click();
        await page.waitForTimeout(500);
        console.log('✓ Onboarding dialog dismissed');
      }
    } catch (e) {
      // Onboarding dialog not present, continue
      console.log('✓ No onboarding dialog to dismiss');
    }

    // Wait for any overlays/modals to disappear
    await page.waitForTimeout(1000);
  });

  test('should navigate to agent workflow tab', async ({ page }) => {
    // Navigate to Agents page
    await page.click('a:has-text("Agents")');
    await page.waitForURL(/\/home\/agents/, { timeout: 5000 });

    console.log('✓ Navigated to Agents page');

    // Wait for agents to load
    await page.waitForSelector(
      '[data-testid="agent-card"], a[href*="/home/agents/"]',
      {
        timeout: 10000,
      },
    );

    // Click on the first agent or navigate directly to test agent
    await page.goto(`/home/agents/${TEST_AGENT_ID}`);
    await page.waitForURL(`/home/agents/${TEST_AGENT_ID}`, { timeout: 5000 });

    console.log('✓ Navigated to agent detail page');

    // Click on Workflow tab
    const workflowTab = page
      .locator('button:has-text("Workflow"), [role="tab"]:has-text("Workflow")')
      .first();
    await workflowTab.click();

    // Verify URL has workflow tab parameter
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await expect(page).toHaveURL(/tab=workflow/);

    console.log('✓ Workflow tab opened successfully');
  });

  test('should load existing workflow from database', async ({ page }) => {
    // Navigate directly to workflow tab
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });

    // Wait for workflow canvas to load
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    console.log('✓ Workflow canvas loaded');

    // Check if workflow nodes are visible (there should be at least the test workflow we created)
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    console.log(`✓ Found ${nodeCount} workflow nodes`);

    if (nodeCount > 0) {
      // Verify "All changes saved" indicator is shown (workflow loaded from DB)
      const savedIndicator = page
        .locator('text=/All changes saved|Saved/i')
        .first();
      await expect(savedIndicator).toBeVisible({ timeout: 5000 });

      console.log('✓ Workflow loaded from database successfully');
    }
  });

  test('should display workflow canvas and controls', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });

    // Verify workflow toolbar is present
    await expect(
      page.locator('button:has-text("Load Template")'),
    ).toBeVisible();
    await expect(page.locator('button:has-text("Undo")')).toBeVisible();
    await expect(page.locator('button:has-text("Redo")')).toBeVisible();
    await expect(page.locator('button:has-text("Add Decision")')).toBeVisible();
    await expect(page.locator('button:has-text("Add Action")')).toBeVisible();

    console.log('✓ Workflow toolbar buttons visible');

    // Verify ReactFlow canvas is present
    await expect(page.locator('.react-flow')).toBeVisible();
    await expect(page.locator('.react-flow__controls')).toBeVisible(); // Zoom controls
    await expect(page.locator('.react-flow__minimap')).toBeVisible(); // Minimap

    console.log('✓ ReactFlow canvas and controls visible');

    // Verify Save Workflow button
    await expect(
      page.locator('button:has-text("Save Workflow")'),
    ).toBeVisible();

    console.log('✓ All workflow UI elements present');
  });

  test('should load workflow template', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });

    // Wait for canvas to load
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Click "Load Template" button
    await page.click('button:has-text("Load Template")');

    // Wait for template selection dialog to open
    await page.waitForSelector('text=/Select.*Template|Choose.*Template/i', {
      timeout: 5000,
    });

    console.log('✓ Template selection dialog opened');

    // Select "Basic Fundraising" template
    await page.click('text=/Basic Fundraising/i');

    // Dialog should close and nodes should appear on canvas
    await page.waitForTimeout(1000); // Wait for nodes to render

    // Count nodes (Basic Fundraising has 8 nodes)
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    expect(nodeCount).toBeGreaterThan(0);
    console.log(`✓ Template loaded with ${nodeCount} nodes`);

    // Verify "Unsaved changes" indicator appears
    const unsavedIndicator = page.locator('text=/Unsaved changes/i').first();
    await expect(unsavedIndicator).toBeVisible({ timeout: 5000 });

    console.log('✓ Template loaded successfully');
  });

  test('should add new decision node to workflow', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Get initial node count
    const initialNodes = await page.locator('.react-flow__node').count();

    // Click "Add Decision" button
    await page.click('button:has-text("Add Decision")');

    // Wait for new node to appear
    await page.waitForTimeout(500);

    // Verify new node was added
    const newNodeCount = await page.locator('.react-flow__node').count();
    expect(newNodeCount).toBe(initialNodes + 1);

    console.log(
      `✓ Decision node added (${initialNodes} → ${newNodeCount} nodes)`,
    );

    // Verify "Unsaved changes" appears
    const unsavedIndicator = page.locator('text=/Unsaved changes/i').first();
    await expect(unsavedIndicator).toBeVisible({ timeout: 5000 });

    console.log('✓ Node added successfully');
  });

  test('should add new action node to workflow', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Get initial node count
    const initialNodes = await page.locator('.react-flow__node').count();

    // Click "Add Action" button
    await page.click('button:has-text("Add Action")');

    // Wait for new node to appear
    await page.waitForTimeout(500);

    // Verify new node was added
    const newNodeCount = await page.locator('.react-flow__node').count();
    expect(newNodeCount).toBe(initialNodes + 1);

    console.log(
      `✓ Action node added (${initialNodes} → ${newNodeCount} nodes)`,
    );
  });

  test('should edit node properties', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Wait for nodes to load
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    if (nodeCount > 0) {
      // Click on the first node to edit it
      await nodes.first().click();

      // Wait for node editor dialog to open
      await page.waitForSelector(
        'input[placeholder*="label"], input[value*="Call"], textarea',
        {
          timeout: 5000,
        },
      );

      console.log('✓ Node editor dialog opened');

      // Find and modify the label field
      const labelInput = page
        .locator('input[placeholder*="label"], input[value*="Call"]')
        .first();
      await labelInput.fill('Modified Node Label E2E Test');

      // Save the changes
      await page.click('button:has-text("Save")');

      // Wait for dialog to close
      await page.waitForTimeout(500);

      console.log('✓ Node properties edited successfully');

      // Verify "Unsaved changes" appears
      const unsavedIndicator = page.locator('text=/Unsaved changes/i').first();
      await expect(unsavedIndicator).toBeVisible({ timeout: 5000 });
    } else {
      console.log('⚠ Skipped: No nodes available to edit');
    }
  });

  test('should save workflow to database', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Make a change to trigger unsaved state
    await page.click('button:has-text("Add Action")');
    await page.waitForTimeout(500);

    // Verify "Unsaved changes" appears
    const unsavedIndicator = page.locator('text=/Unsaved changes/i').first();
    await expect(unsavedIndicator).toBeVisible({ timeout: 5000 });

    console.log('✓ Unsaved changes indicator shown');

    // Click "Save Workflow" button
    const saveButton = page.locator('button:has-text("Save Workflow")');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for saving indicator
    await page.waitForSelector('button:has-text("Saving...")', {
      timeout: 2000,
    });
    console.log('✓ Save initiated');

    // Wait for save to complete (should show "All changes saved")
    await page.waitForSelector('text=/All changes saved|Saved/i', {
      timeout: 10000,
    });
    console.log('✓ Workflow saved successfully');

    // Verify save button is disabled (no unsaved changes)
    await expect(saveButton).toBeDisabled();

    console.log('✓ Workflow saved to database');
  });

  test('should persist workflow across page reload', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Wait for workflow to load
    await page.waitForTimeout(1000);

    // Count nodes before reload
    const nodesBeforeReload = await page.locator('.react-flow__node').count();
    console.log(`✓ Nodes before reload: ${nodesBeforeReload}`);

    // Reload the page
    await page.reload();
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Wait for workflow to reload
    await page.waitForTimeout(1000);

    // Count nodes after reload
    const nodesAfterReload = await page.locator('.react-flow__node').count();
    console.log(`✓ Nodes after reload: ${nodesAfterReload}`);

    // Verify node count is the same (workflow persisted)
    expect(nodesAfterReload).toBe(nodesBeforeReload);

    console.log('✓ Workflow persisted across reload');

    // Verify "All changes saved" indicator (loaded from DB)
    if (nodesAfterReload > 0) {
      const savedIndicator = page
        .locator('text=/All changes saved|Saved/i')
        .first();
      await expect(savedIndicator).toBeVisible({ timeout: 5000 });
      console.log('✓ Workflow loaded from database after reload');
    }
  });

  test('should show workflow instructions', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });

    // Check for workflow instructions
    const instructions = page.locator(
      'text=/Click nodes to edit|Drag to connect|Ctrl/i',
    );
    await expect(instructions).toBeVisible({ timeout: 5000 });

    console.log('✓ Workflow instructions visible');
  });

  test('should undo and redo actions', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Get initial node count
    const initialNodes = await page.locator('.react-flow__node').count();

    // Add a node
    await page.click('button:has-text("Add Action")');
    await page.waitForTimeout(500);

    // Verify node was added
    const nodesAfterAdd = await page.locator('.react-flow__node').count();
    expect(nodesAfterAdd).toBe(initialNodes + 1);
    console.log(`✓ Node added (${initialNodes} → ${nodesAfterAdd})`);

    // Click Undo button
    await page.click('button:has-text("Undo")');
    await page.waitForTimeout(500);

    // Verify node was removed (undo worked)
    const nodesAfterUndo = await page.locator('.react-flow__node').count();
    expect(nodesAfterUndo).toBe(initialNodes);
    console.log(`✓ Undo successful (${nodesAfterAdd} → ${nodesAfterUndo})`);

    // Click Redo button
    await page.click('button:has-text("Redo")');
    await page.waitForTimeout(500);

    // Verify node was re-added (redo worked)
    const nodesAfterRedo = await page.locator('.react-flow__node').count();
    expect(nodesAfterRedo).toBe(initialNodes + 1);
    console.log(`✓ Redo successful (${nodesAfterUndo} → ${nodesAfterRedo})`);

    console.log('✓ Undo/Redo functionality working');
  });

  test('should delete selected node with Delete key', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Wait for nodes to load
    const nodes = page.locator('.react-flow__node');
    const initialNodeCount = await nodes.count();

    if (initialNodeCount > 0) {
      // Click on a node to select it
      await nodes.first().click();
      await page.waitForTimeout(300);

      console.log(`✓ Node selected (${initialNodeCount} nodes total)`);

      // Press Delete key
      await page.keyboard.press('Delete');
      await page.waitForTimeout(500);

      // Verify node was deleted
      const nodesAfterDelete = await page.locator('.react-flow__node').count();
      expect(nodesAfterDelete).toBe(initialNodeCount - 1);

      console.log(
        `✓ Node deleted (${initialNodeCount} → ${nodesAfterDelete} nodes)`,
      );
    } else {
      console.log('⚠ Skipped: No nodes available to delete');
    }
  });

  test('should show proper status indicators', async ({ page }) => {
    await page.goto(`/home/agents/${TEST_AGENT_ID}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Wait for workflow to load
    await page.waitForTimeout(1000);

    // Check if workflow exists
    const nodeCount = await page.locator('.react-flow__node').count();

    if (nodeCount > 0) {
      // Should show "All changes saved" when no changes
      const savedIndicator = page.locator('text=/All changes saved/i').first();
      await expect(savedIndicator).toBeVisible({ timeout: 5000 });
      console.log('✓ "All changes saved" indicator shown');

      // Make a change
      await page.click('button:has-text("Add Action")');
      await page.waitForTimeout(500);

      // Should show "Unsaved changes"
      const unsavedIndicator = page.locator('text=/Unsaved changes/i').first();
      await expect(unsavedIndicator).toBeVisible({ timeout: 5000 });
      console.log('✓ "Unsaved changes" indicator shown');

      console.log('✓ Status indicators working correctly');
    }
  });
});
