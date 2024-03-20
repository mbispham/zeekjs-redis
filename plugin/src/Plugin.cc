#include "config.h"
#include "Plugin.h"

namespace zeek::plugin::zeekjs_redis { Plugin plugin; }

using namespace zeek::plugin::zeekjs_redis;

zeek::plugin::Configuration Plugin::Configure()
        {
        zeek::plugin::Configuration config;
        config.name = "zeekjs::redis";
        config.description = "ZeekJS to Redis.";
        config.version.major = VERSION_MAJOR;
        config.version.minor = VERSION_MINOR;
        config.version.patch = VERSION_PATCH;
        return config;
        }
