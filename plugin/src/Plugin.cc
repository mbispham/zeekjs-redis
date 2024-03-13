#include "config.h"
#include "Plugin.h"

namespace zeek::plugin::zeekjs_redis { Plugin plugin; }

using namespace zeek::plugin::zeekjs_redis;

zeek::plugin::Configuration Plugin::Configure()
        {
        zeek::plugin::Configuration config;
        config.name = "zeekjs::redis";
        config.description = "Interface between Zeek and Redis using JavaScript.";
        config.version.major = 1;
        config.version.minor = 0;
        config.version.patch = 0;
        return config;
        }
