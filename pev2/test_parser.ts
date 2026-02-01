import { parseExplainText } from './parser/index';

const testPlans = [
  {
    name: 'Simple Seq Scan',
    text: `Seq Scan on users  (cost=0.00..14.40 rows=440 width=32) (actual time=0.011..0.012 rows=1 loops=1)
  Filter: (id = 1)
  Rows Removed by Filter: 0
Planning Time: 0.051 ms
Execution Time: 0.032 ms`
  },
  {
    name: 'Nested Loop',
    text: `Nested Loop  (cost=0.29..16.35 rows=1 width=32) (actual time=0.024..0.025 rows=1 loops=1)
  ->  Index Scan using users_pkey on users  (cost=0.29..8.30 rows=1 width=32) (actual time=0.014..0.015 rows=1 loops=1)
        Index Cond: (id = 1)
  ->  Index Scan using orders_user_id_idx on orders  (cost=0.00..8.05 rows=1 width=0) (actual time=0.007..0.007 rows=1 loops=1)
        Index Cond: (user_id = 1)
Planning Time: 0.124 ms
Execution Time: 0.058 ms`
  }
];

testPlans.forEach(plan => {
  console.log(`Testing: ${plan.name}`);
  const result = parseExplainText(plan.text);
  if (result.ok) {
    console.log('  Result: OK');
    console.log('  Node Type:', result.plan.content.Plan['Node Type']);
    console.log('  Exclusive Duration:', result.plan.content.Plan['*Duration (exclusive)']);
  } else {
    console.log('  Result: FAILED');
    console.log('  Error:', result.error);
  }
  console.log('---');
});
