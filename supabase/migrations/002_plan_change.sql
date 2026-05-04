-- 既存の business プランユーザーを pro に移行
update subscriptions
set plan = 'pro'
where plan = 'business';

-- business プランだったが status が非アクティブなユーザーは free に戻す
-- （念のため、active/trialing 以外は free に）
update subscriptions
set plan = 'free'
where plan not in ('free', 'pro')
   or (plan = 'pro' and status not in ('active', 'trialing'));
