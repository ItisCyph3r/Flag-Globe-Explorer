-- Add welcome email template
INSERT INTO public.email_templates (
    template_name,
    subject,
    content,
    description,
    variables,
    status
) VALUES (
    'welcome_email',
    'Welcome to Flag Globe Explorer!',
    '<html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to Flag Globe Explorer!</h1>
        </div>
        <div class="content">
            <p>Hi {{name}},</p>
            <p>Thank you for joining Flag Globe Explorer! We''re excited to have you on board.</p>
            <p>With Flag Globe Explorer, you can:</p>
            <ul>
                <li>Learn flags from around the world</li>
                <li>Test your knowledge with fun quizzes</li>
                <li>Track your progress as you master different continents</li>
            </ul>
            <p>Ready to start your flag learning journey?</p>
            <a href="{{app_url}}" class="button">Start Exploring Flags</a>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Happy flag learning!</p>
            <p>The Flag Globe Explorer Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Flag Globe Explorer. All rights reserved.</p>
            <p>You received this email because you signed up for Flag Globe Explorer.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
        </div>
    </body>
</html>',
    'Welcome email sent to new users after sign-up',
    '{"name": "User''s name", "app_url": "Application URL", "unsubscribe_url": "Unsubscribe URL"}',
    'active'
)
ON CONFLICT (template_name) 
DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    description = EXCLUDED.description,
    variables = EXCLUDED.variables,
    status = EXCLUDED.status,
    updated_at = TIMEZONE('utc', NOW()); 