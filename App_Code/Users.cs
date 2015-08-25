using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BLL
{

    /// <summary>
    /// Users 的摘要说明
    /// </summary>
    public class User
    {
        public User()
        {
            time = DateTime.Now.ToString();
        }
        public string id { get; set; }
        public string nickname { get; set; }
        public string age { get; set; }
        public string sex { get; set; }
        public string city { get; set; }
        public string hobby { get; set; }
        public string time { get; set; }
        public string description { get; set; }
        public string email { get; set; }
        public string mobile { get; set; }
        public string zipCode { get; set; }
        public static void Add(User user)
        {
            _users.Add(user);
        }
        public static List<User> Users { get { return _users; } }
        private static List<User> _users = new List<User>();
    }
}
