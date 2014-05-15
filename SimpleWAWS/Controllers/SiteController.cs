﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using SimpleWAWS.Code;

namespace SimpleWAWS.Controllers
{
    [RoutePrefix("api/site")]
    public class SiteController : ApiController
    {
        [Route("{siteId}")]
        [HttpGet]
        public async Task<HttpResponseMessage> Get(string siteId)
        {
            var siteManager = await SiteManager.GetInstanceAsync();
            return Request.CreateResponse(HttpStatusCode.OK, siteManager.GetSite(siteId));
        }

        [Route("~/api/reset")]
        [HttpGet]
        public async Task<HttpResponseMessage> Reset()
        {
            var siteManager = await SiteManager.GetInstanceAsync();
            await siteManager.ResetAllFreeSites();
            return Request.CreateResponse(HttpStatusCode.Accepted);
        }

        [Route("getpublishingprofile/{siteId}")]
        public async Task<HttpResponseMessage> GetPublishingProfile(string siteId)
        {
            var response = Request.CreateResponse();
            var siteManager = await SiteManager.GetInstanceAsync();
            var site = siteManager.GetSite(siteId);
            response.Content = await site.GetPublishingProfile();
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            response.Content.Headers.ContentDisposition =
                new ContentDispositionHeaderValue("attachment") { FileName = string.Format("{0}.publishsettings", site.Name) };
            return response;
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Post([FromBody] Template template)
        {
            try
            {
                var siteManager = await SiteManager.GetInstanceAsync();
                var site = 
                    await
                        siteManager.ActivateSiteAsync(template == null
                            ? null
                            : TemplatesManager.GetTemplates()
                                .SingleOrDefault(t => t.Name == template.Name && t.Language == template.Language));
                return Request.CreateResponse(HttpStatusCode.OK, site);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.ServiceUnavailable, ex.Message);
            }
        }

        [Route("{siteId}")]
        [HttpDelete]
        public async Task<HttpResponseMessage> Delete(string siteId)
        {
            var siteManager = await SiteManager.GetInstanceAsync();
            await siteManager.DeleteSite(siteId);
            return Request.CreateResponse(HttpStatusCode.Accepted);
        }
    }
}