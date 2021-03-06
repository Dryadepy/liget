﻿using System;
using System.Linq;
using Gelf.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LiGet.Extensions
{
    // See https://github.com/aspnet/MetaPackages/blob/master/src/Microsoft.AspNetCore/WebHost.cs
    public static class IHostBuilderExtensions
    {
        public static IHostBuilder ConfigureLiGetConfiguration(this IHostBuilder builder, string[] args)
        {
            return builder.ConfigureAppConfiguration((context, config) =>
            {               
                config
                    .SetBasePath(Environment.CurrentDirectory)
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

                if (args != null)
                {
                    config.AddCommandLine(args);
                }
            });

        }

        public static IHostBuilder ConfigureLiGetLogging(this IHostBuilder builder)
        {
            return builder
                .ConfigureServices((hostBuilder, services) => {
                    var graylogSection = hostBuilder.Configuration.GetSection("Graylog");
                    if(graylogSection.GetChildren().Any())
                        services.Configure<GelfLoggerOptions>(graylogSection);
                })
                .ConfigureLogging((context, logging) =>
                {
                    logging.AddConfiguration(context.Configuration.GetSection("Logging"));
                    logging.AddConsole();
                    logging.AddDebug();         
                    var graylogSection = context.Configuration.GetSection("Graylog");
                    if(graylogSection.GetChildren().Any())               
                        logging.AddGelf();
                });
        }

        public static IHostBuilder ConfigureLiGetServices(this IHostBuilder builder)
        {
            return builder
                .ConfigureServices((context, services) => services.ConfigureLiGet(context.Configuration));
        }
    }
}
