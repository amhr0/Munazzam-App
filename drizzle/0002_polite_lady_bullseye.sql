CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`integrationId` int NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`location` text,
	`attendees` text,
	`status` enum('confirmed','tentative','cancelled') NOT NULL DEFAULT 'confirmed',
	`meetingUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`integrationId` int NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`subject` text NOT NULL,
	`from` varchar(320) NOT NULL,
	`to` text,
	`body` text,
	`receivedAt` timestamp NOT NULL,
	`analyzed` int NOT NULL DEFAULT 0,
	`extractedTasks` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('google','microsoft') NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp,
	`scope` text,
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
