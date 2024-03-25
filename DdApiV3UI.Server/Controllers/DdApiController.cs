using DdApiV3UI.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using CsdlPropertyInspector;
using static CsdlPropertyInspector.CsdlInspector;

namespace DdApiV3UI.Server.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class DdApiController(IConfiguration configuration) : ControllerBase
	{
		/// <summary>
		/// Validate the specified server URI by examining the $metadata manifest and return a more convenient data structure.
		/// </summary>
		/// <param name="queryParameters">Query parameters.</param>
		/// <returns>Data structure from the manifest, or an empty dictionary.</returns>
		[Route("validate")]
		[HttpPost]
		public async Task<Dictionary<string, CsdlType>> ValidateAsync([FromBody] QueryParameters queryParameters)
		{
			var client      = new HttpClient();
			var metaDataUri = new Uri($"{queryParameters.DdApiBaseUrl}/$metadata"); // Examine the $metadata manifest.
			var response    = await client.GetAsync(metaDataUri).ConfigureAwait(false);
			var metaData    = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
			
			return !string.IsNullOrEmpty(metaData) ? Inspect(metaData, "Observation") : new Dictionary<string, CsdlType>();
		}

		/// <summary>
		/// Return the configured defaults of this server.
		/// </summary>
		/// <returns>Configuration defaults</returns>
		[Route("defaultsettings")]
		[HttpGet]
		public ActionResult<DefaultSettings> GetDefaultsAsync()
		{
			return Ok(new DefaultSettings
			{
				AuthenticationUrl = configuration["authenticationUrl"],
				DdApiBaseUrl      = configuration["ddApiBaseUrl"],
				ClientId          = configuration["clientId"],
				ClientSecret      = configuration["clientSecret"],
				GrantType         = configuration["grantType"],
				Scope             = configuration["scope"]
			});
		}
		
		/// <summary>
		/// Authenticate, if needed, and send the query to the DD-API service. Return the result.
		/// </summary>
		/// <param name="queryParameters">Holds the request data: authentication data, and DD-API service URI and the OData query.</param>
		/// <returns>Response as OK, or an error response otherwise.</returns>
		/// <exception cref="Exception">Exception on incorrect data.</exception>
		[Route("query")]
		[HttpPost]
		public async Task<ActionResult<string>> QueryAsync([FromBody] QueryParameters queryParameters)
		{
			try
			{
				var queryUrl = queryParameters.DdApiQueryUrl;
				if (string.IsNullOrEmpty(queryUrl))
				{
					return BadRequest();
				}

				var queryUri = new Uri(queryUrl);
				var client   = new HttpClient();
				if (queryParameters.AuthenticationUrl != null)
				{
					if (string.IsNullOrWhiteSpace(queryParameters.ClientId) || string.IsNullOrWhiteSpace(queryParameters.ClientSecret))
					{
						return Unauthorized();
					}
					
					var authenticationResult = await AuthenticateAsync(queryParameters).ConfigureAwait(false);
					if (string.IsNullOrWhiteSpace(authenticationResult))
					{
						return Unauthorized();
					}
						
					var token = System.Text.Json.JsonSerializer.Deserialize<AuthenticationResult>(authenticationResult)?.AccessToken;
					client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
				}

				var request = new HttpRequestMessage(HttpMethod.Get, queryUri);
				request.Headers.Add("prefer", "omit-values=nulls"); // Ignore nulls to reduce the response size.
				
				var response = await client.SendAsync(request);
				response.EnsureSuccessStatusCode();
					
				return Ok(await response.Content.ReadAsStringAsync());
			}
			catch (Exception e)
			{
				throw new Exception(e.ToString());
			}
		}

		/// <summary>
		/// Authenticate using OAUTH2.
		/// </summary>
		/// <param name="queryParameters"></param>
		/// <returns></returns>
		private static async Task<string> AuthenticateAsync(QueryParameters queryParameters)
		{
			using var client            = new HttpClient();
			var       authenticationUri = new Uri(queryParameters.AuthenticationUrl ?? string.Empty);
			var formData = new Dictionary<string, string> {
					{ "grant_type", queryParameters.GrantType       ?? string.Empty },
					{ "client_id", queryParameters.ClientId         ?? string.Empty },
					{ "client_secret", queryParameters.ClientSecret ?? string.Empty },
					{ "scope", queryParameters.Scope                ?? string.Empty }
				};

			using var content = new FormUrlEncodedContent(formData);
			content.Headers.Clear();
			content.Headers.Add("Content_Type", "application/x-form-urlencoded");
			
			var response = await client.PostAsync(authenticationUri, content).ConfigureAwait(false);
			
			return await response.Content.ReadAsStringAsync();
		}
	}
}
