using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System;

namespace FSW.dhtmlx.Standard
{
    public class Startup : Core.StartupBase
    {
        public override void ConfigureMvc(IMvcBuilder mvc)
        {
        }
        // This method gets called by the runtime. Use this method to add services to the container.
        public override void ConfigureServices(IServiceCollection services)
        {
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public override void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            RegisterFiles(new[]
            {
                "wwwroot.lib.dhtmlxGantt.dhtmlxgantt.js",
                "wwwroot.lib.dhtmlxGantt.ext.dhtmlxgantt_smart_rendering.js",
                "wwwroot.lib.dhtmlxGantt.ext.dhtmlxgantt_tooltip.js",
                "wwwroot.lib.dhtmlxGantt.dhtmlxgantt.css",
            });
            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new EmbeddedFileProvider(typeof(Startup).Assembly, "FSW.Standard.wwwroot")
            });

            ForceCurrentLibToLoadBeforeThis<dhtmlx.Startup>();
        }
    }
}
