/* eslint-disable */
import type { Prisma, Brand, Model, Generation, Part, ModelPart, SchematicZone, Price, User, Calculation, Subscription, PaymentMethod, YooPayment, UsageLog, Broadcast, MonitorSubscription, MonitorLog, MonitorListing, AdminSearchWatch, UnmatchedListing } from "@prisma/client";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    Brand: {
        Name: "Brand";
        Shape: Brand;
        Include: Prisma.BrandInclude;
        Select: Prisma.BrandSelect;
        OrderBy: Prisma.BrandOrderByWithRelationInput;
        WhereUnique: Prisma.BrandWhereUniqueInput;
        Where: Prisma.BrandWhereInput;
        Create: {};
        Update: {};
        RelationName: "models";
        ListRelations: "models";
        Relations: {
            models: {
                Shape: Model[];
                Name: "Model";
                Nullable: false;
            };
        };
    };
    Model: {
        Name: "Model";
        Shape: Model;
        Include: Prisma.ModelInclude;
        Select: Prisma.ModelSelect;
        OrderBy: Prisma.ModelOrderByWithRelationInput;
        WhereUnique: Prisma.ModelWhereUniqueInput;
        Where: Prisma.ModelWhereInput;
        Create: {};
        Update: {};
        RelationName: "brand" | "generations";
        ListRelations: "generations";
        Relations: {
            brand: {
                Shape: Brand;
                Name: "Brand";
                Nullable: false;
            };
            generations: {
                Shape: Generation[];
                Name: "Generation";
                Nullable: false;
            };
        };
    };
    Generation: {
        Name: "Generation";
        Shape: Generation;
        Include: Prisma.GenerationInclude;
        Select: Prisma.GenerationSelect;
        OrderBy: Prisma.GenerationOrderByWithRelationInput;
        WhereUnique: Prisma.GenerationWhereUniqueInput;
        Where: Prisma.GenerationWhereInput;
        Create: {};
        Update: {};
        RelationName: "model" | "modelParts" | "prices" | "calculations";
        ListRelations: "modelParts" | "prices" | "calculations";
        Relations: {
            model: {
                Shape: Model;
                Name: "Model";
                Nullable: false;
            };
            modelParts: {
                Shape: ModelPart[];
                Name: "ModelPart";
                Nullable: false;
            };
            prices: {
                Shape: Price[];
                Name: "Price";
                Nullable: false;
            };
            calculations: {
                Shape: Calculation[];
                Name: "Calculation";
                Nullable: false;
            };
        };
    };
    Part: {
        Name: "Part";
        Shape: Part;
        Include: Prisma.PartInclude;
        Select: Prisma.PartSelect;
        OrderBy: Prisma.PartOrderByWithRelationInput;
        WhereUnique: Prisma.PartWhereUniqueInput;
        Where: Prisma.PartWhereInput;
        Create: {};
        Update: {};
        RelationName: "schematicZone" | "modelParts" | "prices";
        ListRelations: "modelParts" | "prices";
        Relations: {
            schematicZone: {
                Shape: SchematicZone | null;
                Name: "SchematicZone";
                Nullable: true;
            };
            modelParts: {
                Shape: ModelPart[];
                Name: "ModelPart";
                Nullable: false;
            };
            prices: {
                Shape: Price[];
                Name: "Price";
                Nullable: false;
            };
        };
    };
    ModelPart: {
        Name: "ModelPart";
        Shape: ModelPart;
        Include: Prisma.ModelPartInclude;
        Select: Prisma.ModelPartSelect;
        OrderBy: Prisma.ModelPartOrderByWithRelationInput;
        WhereUnique: Prisma.ModelPartWhereUniqueInput;
        Where: Prisma.ModelPartWhereInput;
        Create: {};
        Update: {};
        RelationName: "generation" | "part";
        ListRelations: never;
        Relations: {
            generation: {
                Shape: Generation;
                Name: "Generation";
                Nullable: false;
            };
            part: {
                Shape: Part;
                Name: "Part";
                Nullable: false;
            };
        };
    };
    SchematicZone: {
        Name: "SchematicZone";
        Shape: SchematicZone;
        Include: Prisma.SchematicZoneInclude;
        Select: Prisma.SchematicZoneSelect;
        OrderBy: Prisma.SchematicZoneOrderByWithRelationInput;
        WhereUnique: Prisma.SchematicZoneWhereUniqueInput;
        Where: Prisma.SchematicZoneWhereInput;
        Create: {};
        Update: {};
        RelationName: "parts";
        ListRelations: "parts";
        Relations: {
            parts: {
                Shape: Part[];
                Name: "Part";
                Nullable: false;
            };
        };
    };
    Price: {
        Name: "Price";
        Shape: Price;
        Include: Prisma.PriceInclude;
        Select: Prisma.PriceSelect;
        OrderBy: Prisma.PriceOrderByWithRelationInput;
        WhereUnique: Prisma.PriceWhereUniqueInput;
        Where: Prisma.PriceWhereInput;
        Create: {};
        Update: {};
        RelationName: "part" | "generation";
        ListRelations: never;
        Relations: {
            part: {
                Shape: Part;
                Name: "Part";
                Nullable: false;
            };
            generation: {
                Shape: Generation | null;
                Name: "Generation";
                Nullable: true;
            };
        };
    };
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "calculations" | "usageLogs" | "subscriptions" | "paymentMethods" | "yooPayments" | "monitorSubscriptions" | "adminSearchWatches";
        ListRelations: "calculations" | "usageLogs" | "subscriptions" | "paymentMethods" | "yooPayments" | "monitorSubscriptions" | "adminSearchWatches";
        Relations: {
            calculations: {
                Shape: Calculation[];
                Name: "Calculation";
                Nullable: false;
            };
            usageLogs: {
                Shape: UsageLog[];
                Name: "UsageLog";
                Nullable: false;
            };
            subscriptions: {
                Shape: Subscription[];
                Name: "Subscription";
                Nullable: false;
            };
            paymentMethods: {
                Shape: PaymentMethod[];
                Name: "PaymentMethod";
                Nullable: false;
            };
            yooPayments: {
                Shape: YooPayment[];
                Name: "YooPayment";
                Nullable: false;
            };
            monitorSubscriptions: {
                Shape: MonitorSubscription[];
                Name: "MonitorSubscription";
                Nullable: false;
            };
            adminSearchWatches: {
                Shape: AdminSearchWatch[];
                Name: "AdminSearchWatch";
                Nullable: false;
            };
        };
    };
    Calculation: {
        Name: "Calculation";
        Shape: Calculation;
        Include: Prisma.CalculationInclude;
        Select: Prisma.CalculationSelect;
        OrderBy: Prisma.CalculationOrderByWithRelationInput;
        WhereUnique: Prisma.CalculationWhereUniqueInput;
        Where: Prisma.CalculationWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "generation";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            generation: {
                Shape: Generation;
                Name: "Generation";
                Nullable: false;
            };
        };
    };
    Subscription: {
        Name: "Subscription";
        Shape: Subscription;
        Include: Prisma.SubscriptionInclude;
        Select: Prisma.SubscriptionSelect;
        OrderBy: Prisma.SubscriptionOrderByWithRelationInput;
        WhereUnique: Prisma.SubscriptionWhereUniqueInput;
        Where: Prisma.SubscriptionWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "payments";
        ListRelations: "payments";
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            payments: {
                Shape: YooPayment[];
                Name: "YooPayment";
                Nullable: false;
            };
        };
    };
    PaymentMethod: {
        Name: "PaymentMethod";
        Shape: PaymentMethod;
        Include: Prisma.PaymentMethodInclude;
        Select: Prisma.PaymentMethodSelect;
        OrderBy: Prisma.PaymentMethodOrderByWithRelationInput;
        WhereUnique: Prisma.PaymentMethodWhereUniqueInput;
        Where: Prisma.PaymentMethodWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    YooPayment: {
        Name: "YooPayment";
        Shape: YooPayment;
        Include: Prisma.YooPaymentInclude;
        Select: Prisma.YooPaymentSelect;
        OrderBy: Prisma.YooPaymentOrderByWithRelationInput;
        WhereUnique: Prisma.YooPaymentWhereUniqueInput;
        Where: Prisma.YooPaymentWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "subscription";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            subscription: {
                Shape: Subscription | null;
                Name: "Subscription";
                Nullable: true;
            };
        };
    };
    UsageLog: {
        Name: "UsageLog";
        Shape: UsageLog;
        Include: Prisma.UsageLogInclude;
        Select: Prisma.UsageLogSelect;
        OrderBy: Prisma.UsageLogOrderByWithRelationInput;
        WhereUnique: Prisma.UsageLogWhereUniqueInput;
        Where: Prisma.UsageLogWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    Broadcast: {
        Name: "Broadcast";
        Shape: Broadcast;
        Include: never;
        Select: Prisma.BroadcastSelect;
        OrderBy: Prisma.BroadcastOrderByWithRelationInput;
        WhereUnique: Prisma.BroadcastWhereUniqueInput;
        Where: Prisma.BroadcastWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    MonitorSubscription: {
        Name: "MonitorSubscription";
        Shape: MonitorSubscription;
        Include: Prisma.MonitorSubscriptionInclude;
        Select: Prisma.MonitorSubscriptionSelect;
        OrderBy: Prisma.MonitorSubscriptionOrderByWithRelationInput;
        WhereUnique: Prisma.MonitorSubscriptionWhereUniqueInput;
        Where: Prisma.MonitorSubscriptionWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    MonitorLog: {
        Name: "MonitorLog";
        Shape: MonitorLog;
        Include: never;
        Select: Prisma.MonitorLogSelect;
        OrderBy: Prisma.MonitorLogOrderByWithRelationInput;
        WhereUnique: Prisma.MonitorLogWhereUniqueInput;
        Where: Prisma.MonitorLogWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    MonitorListing: {
        Name: "MonitorListing";
        Shape: MonitorListing;
        Include: never;
        Select: Prisma.MonitorListingSelect;
        OrderBy: Prisma.MonitorListingOrderByWithRelationInput;
        WhereUnique: Prisma.MonitorListingWhereUniqueInput;
        Where: Prisma.MonitorListingWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    AdminSearchWatch: {
        Name: "AdminSearchWatch";
        Shape: AdminSearchWatch;
        Include: Prisma.AdminSearchWatchInclude;
        Select: Prisma.AdminSearchWatchSelect;
        OrderBy: Prisma.AdminSearchWatchOrderByWithRelationInput;
        WhereUnique: Prisma.AdminSearchWatchWhereUniqueInput;
        Where: Prisma.AdminSearchWatchWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    UnmatchedListing: {
        Name: "UnmatchedListing";
        Shape: UnmatchedListing;
        Include: never;
        Select: Prisma.UnmatchedListingSelect;
        OrderBy: Prisma.UnmatchedListingOrderByWithRelationInput;
        WhereUnique: Prisma.UnmatchedListingWhereUniqueInput;
        Where: Prisma.UnmatchedListingWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"Brand\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"logo\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"sortOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Model\",\"kind\":\"object\",\"name\":\"models\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BrandToModel\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Model\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"brandId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isPopular\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"sortOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Brand\",\"kind\":\"object\",\"name\":\"brand\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BrandToModel\",\"relationFromFields\":[\"brandId\"],\"isUpdatedAt\":false},{\"type\":\"Generation\",\"kind\":\"object\",\"name\":\"generations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GenerationToModel\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"brandId\",\"slug\"]}]},\"Generation\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"modelId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"yearStart\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"yearEnd\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BodyType\",\"kind\":\"enum\",\"name\":\"bodyType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Model\",\"kind\":\"object\",\"name\":\"model\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GenerationToModel\",\"relationFromFields\":[\"modelId\"],\"isUpdatedAt\":false},{\"type\":\"ModelPart\",\"kind\":\"object\",\"name\":\"modelParts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GenerationToModelPart\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Price\",\"kind\":\"object\",\"name\":\"prices\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GenerationToPrice\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Calculation\",\"kind\":\"object\",\"name\":\"calculations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CalculationToGeneration\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"modelId\",\"slug\"]}]},\"Part\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"PartCategory\",\"kind\":\"enum\",\"name\":\"category\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"schematicZoneId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"searchQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"configGroup\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isShared\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"oemCode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SchematicZone\",\"kind\":\"object\",\"name\":\"schematicZone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PartToSchematicZone\",\"relationFromFields\":[\"schematicZoneId\"],\"isUpdatedAt\":false},{\"type\":\"ModelPart\",\"kind\":\"object\",\"name\":\"modelParts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ModelPartToPart\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Price\",\"kind\":\"object\",\"name\":\"prices\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PartToPrice\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ModelPart\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"generationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"partId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDefault\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Generation\",\"kind\":\"object\",\"name\":\"generation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GenerationToModelPart\",\"relationFromFields\":[\"generationId\"],\"isUpdatedAt\":false},{\"type\":\"Part\",\"kind\":\"object\",\"name\":\"part\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ModelPartToPart\",\"relationFromFields\":[\"partId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"generationId\",\"partId\"]}]},\"SchematicZone\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ZoneType\",\"kind\":\"enum\",\"name\":\"zoneType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"sortOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Part\",\"kind\":\"object\",\"name\":\"parts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PartToSchematicZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Price\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"partId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"generationId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"minPrice\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"maxPrice\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"median\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"avgPrice\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"sampleSize\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"minPriceUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"maxPriceUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"medianPriceUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"searchUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"source\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"fetchedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"liquidityScore\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"liquidityListings\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"liquidityAgeDays\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Part\",\"kind\":\"object\",\"name\":\"part\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PartToPrice\",\"relationFromFields\":[\"partId\"],\"isUpdatedAt\":false},{\"type\":\"Generation\",\"kind\":\"object\",\"name\":\"generation\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GenerationToPrice\",\"relationFromFields\":[\"generationId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"partId\",\"generationId\",\"source\"]}]},\"User\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"telegramId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"firstName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"username\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isPremium\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"trialCredits\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"trialMonitorStartedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Calculation\",\"kind\":\"object\",\"name\":\"calculations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CalculationToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UsageLog\",\"kind\":\"object\",\"name\":\"usageLogs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UsageLogToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Subscription\",\"kind\":\"object\",\"name\":\"subscriptions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SubscriptionToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PaymentMethod\",\"kind\":\"object\",\"name\":\"paymentMethods\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PaymentMethodToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"YooPayment\",\"kind\":\"object\",\"name\":\"yooPayments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToYooPayment\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"MonitorSubscription\",\"kind\":\"object\",\"name\":\"monitorSubscriptions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MonitorSubscriptionToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AdminSearchWatch\",\"kind\":\"object\",\"name\":\"adminSearchWatches\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AdminSearchWatchToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Calculation\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"generationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"totalPrice\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"damagedZones\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"details\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CalculationToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Generation\",\"kind\":\"object\",\"name\":\"generation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CalculationToGeneration\",\"relationFromFields\":[\"generationId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Subscription\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SubscriptionPlan\",\"kind\":\"enum\",\"name\":\"plan\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SubscriptionStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"credits\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"creditsTotal\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"currentPeriodStart\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"currentPeriodEnd\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"cancelAtPeriodEnd\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"retryCount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastRetryAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SubscriptionToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"YooPayment\",\"kind\":\"object\",\"name\":\"payments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SubscriptionToYooPayment\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"PaymentMethod\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"yooPaymentMethodId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"cardLast4\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"cardType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"expiryMonth\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"expiryYear\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDefault\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PaymentMethodToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"YooPayment\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"subscriptionId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"yooPaymentId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"idempotencyKey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"amount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"currency\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isRecurring\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToYooPayment\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Subscription\",\"kind\":\"object\",\"name\":\"subscription\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SubscriptionToYooPayment\",\"relationFromFields\":[\"subscriptionId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UsageLog\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"action\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"metadata\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UsageLogToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Broadcast\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"message\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"imageUrls\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"pinMessage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BroadcastStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"totalUsers\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"sentCount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"failedCount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"MonitorSubscription\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MonitorSubscriptionToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"label\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"brandSlug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"modelSlug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"city\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"priceMin\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"priceMax\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"yearMin\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"yearMax\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"mileageMax\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"searchRadius\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expiresAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"notificationsSent\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastNotifiedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"MonitorLog\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"MonitorLogType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"LogLevel\",\"kind\":\"enum\",\"name\":\"level\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"brandSlug\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"modelSlug\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"message\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"meta\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"MonitorListing\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"extId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"regionSlug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"brand\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"model\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"engineVolume\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"transmission\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"price\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"year\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"url\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"city\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"imageUrl\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"publishedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sellerType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"mileage\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDamaged\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"generationId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"configGroups\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"estimateMin\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"estimateMax\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"estimateAvg\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"estimateExact\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"profit\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastSeenAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"extId\",\"regionSlug\"]}]},\"AdminSearchWatch\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AdminSearchWatchToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"label\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"url\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"notificationsSent\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastNotifiedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastCrawledAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UnmatchedListing\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"regionSlug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"extId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"brand\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"model\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"year\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"price\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reason\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"extId\",\"regionSlug\"]}]}}}}"); }