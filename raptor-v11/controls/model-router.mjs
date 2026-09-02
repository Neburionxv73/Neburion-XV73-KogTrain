import fs from 'node:fs';
const policy = JSON.parse(fs.readFileSync(new URL('../policies/model-governance.json', import.meta.url)));
const rank = { PUBLIC: 0, INTERNAL: 1, CONFIDENTIAL: 2, RESTRICTED: 3 };

export function routeModel({ dataClass, requestedModel, requestedTool }) {
  const rule = policy.rules[dataClass];
  const model = policy.models[requestedModel];
  if (!rule || !model) return { allowed: false, decision: 'DENY', reason: !rule ? 'UNKNOWN_DATA_CLASS' : 'UNKNOWN_MODEL' };
  if (!rule.allowedModels.includes(requestedModel)) return { allowed: false, decision: 'DENY', reason: 'MODEL_NOT_ALLOWED_FOR_DATA_CLASS' };
  if (rank[dataClass] > rank[model.maxDataClass]) return { allowed: false, decision: 'DENY', reason: 'MODEL_DATA_CLASS_LIMIT' };
  if (requestedTool && !model.tools.includes(requestedTool)) return { allowed: false, decision: 'DENY', reason: 'TOOL_NOT_ALLOWED_FOR_MODEL' };
  if (dataClass === 'RESTRICTED' && rule.denyExternalTools && requestedTool === 'web.read') return { allowed: false, decision: 'DENY', reason: 'EXTERNAL_TOOL_DENIED_FOR_RESTRICTED' };
  return { allowed: true, decision: 'ALLOW', reason: 'POLICY_MATCH', model: requestedModel, dataClass, tool: requestedTool || null };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [dataClass, model, tool] = process.argv.slice(2);
  const result = routeModel({ dataClass, requestedModel: model, requestedTool: tool });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.allowed ? 0 : 1);
}
